/**
 * Blueprint Envision — Firebase Cloud Functions
 * ──────────────────────────────────────────────
 * Ports all Express API routes from server.ts to Cloud Functions.
 * The frontend is hosted on GitHub Pages; these functions handle
 * AI image generation, lead capture, and Stripe billing.
 */

import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';

// ── Secrets (set via `firebase functions:secrets:set`) ──────────────────────
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const resendApiKey = defineSecret('RESEND_API_KEY');
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');
const leadEmail = defineSecret('LEAD_EMAIL');
const resendFrom = defineSecret('RESEND_FROM');

// ── Express app ─────────────────────────────────────────────────────────────
const app = express();

// CORS — allow GitHub Pages + local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://blueprintaiconsulting.github.io',
  'https://blueprint-envision-platform.onrender.com' // keep old origin during migration
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '50mb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────────
const generationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment before trying again.' }
});

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' }
});

// ── Utilities ──────────────────────────────────────────────────────────────────
const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)),
  ]);

function validateImagePayload(base64: string, mime: string = '') {
  if (!base64) throw new Error('Missing imageBase64 payload');
  const rawBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  if (rawBase64.length < 100) throw new Error('imageBase64 payload is too small to be a valid image');

  let activeMime = mime;
  if (!activeMime && base64.startsWith('data:image/')) {
    activeMime = base64.substring(5, base64.indexOf(';'));
  }

  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (activeMime && !validMimes.includes(activeMime.toLowerCase())) {
    throw new Error(`Invalid image MIME type: ${activeMime}. Must be jpeg, png, webp, or heic.`);
  }

  const roughSizeBytes = rawBase64.length * 0.75;
  if (roughSizeBytes > 20 * 1024 * 1024) throw new Error('Image exceeds 20MB safety limit');
}

// ── Lazy AI client (initialized on first request) ───────────────────────────
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return aiClient;
}

// ══════════════════════════════════════════════════════════════════════════════
//   API Routes
// ══════════════════════════════════════════════════════════════════════════════

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/ping', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), ts: new Date().toISOString() });
});

// ── POST /auto-mask ──────────────────────────────────────────────────────────
app.post('/auto-mask', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType, maskTarget } = req.body;
  if (!imageBase64 || !maskTarget) {
    return res.status(400).json({ error: 'Missing required fields: imageBase64, maskTarget.' });
  }

  try {
    validateImagePayload(imageBase64, mimeType);
    const ai = getAI();
    const targetLower = maskTarget.toLowerCase();
    const allExclusions = ['roof', 'windows', 'window frames', 'shutters', 'doors', 'garage doors', 'trim', 'gutters', 'downspouts', 'fascia', 'soffits', 'foundation', 'concrete', 'sky', 'grass', 'trees', 'plants', 'people', 'vehicles', 'shadows'];
    const activeExclusions = allExclusions.filter(e => !targetLower.includes(e));

    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType || 'image/png' } },
          {
            text: `Create a pixel-perfect, high-contrast binary segmentation mask (black and white only) for the following target: "${maskTarget}".
              
CRITICAL RULES:
1. The ${maskTarget} MUST be PURE WHITE (#FFFFFF).
2. EVERYTHING ELSE MUST be PURE BLACK (#000000).
3. EXCLUDE: ${activeExclusions.join(', ')}.
4. SHARP EDGES: Ensure the mask has crisp, sharp boundaries. NO BLUR, NO GRADIENTS, NO GRAYSCALE.
5. ACCURACY: Carefully follow the architectural lines of the house.
6. OUTPUT: Return only a flat, 2D black and white silhouette mask image.`,
          },
        ],
      },
    }), 90_000, 'auto-mask');

    let maskBase64 = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        const id = (part as any).inlineData;
        maskBase64 = `data:${id.mimeType};base64,${id.data}`;
        break;
      }
    }

    if (!maskBase64) {
      return res.status(500).json({ error: 'No mask was generated by the AI model.' });
    }

    res.json({ maskBase64 });
  } catch (err: any) {
    console.error('[auto-mask] error:', err?.message);
    res.status(500).json({ error: err?.message || 'Auto-mask generation failed.' });
  }
});

// ── POST /quick-render ───────────────────────────────────────────────────────
type TextureStyleKey = 'horizontal-lap' | 'dutch-lap' | 'board-batten' | 'shake';
interface QuickZoneData { name: string; lineName: string; colorName: string; colorHex: string; hue: string; style?: 'horizontal' | 'vertical'; textureStyle?: TextureStyleKey; }

const TEXTURE_PROFILE_DESCRIPTIONS: Record<TextureStyleKey, string> = {
  'horizontal-lap':  'traditional horizontal lap clapboard siding — planks run parallel to ground with a slight bottom reveal on each course',
  'dutch-lap':       'Dutch lap (dutchlap) horizontal siding — each plank has a distinctive concave scoop routed at the top edge creating a shadow line',
  'board-batten':    'vertical board-and-batten siding — wide vertical boards separated by narrow battens running continuously from foundation to eave',
  'shake':           'staggered cedar perfection shingle siding — squared-edge cedar shingles in overlapping horizontal rows with visible individual shingle units',
};

app.post('/quick-render', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType, zones } = req.body as { imageBase64: string; mimeType: string; zones: QuickZoneData[] };
  if (!imageBase64 || !zones?.length) return res.status(400).json({ error: 'Missing imageBase64 or zones.' });

  try {
    validateImagePayload(imageBase64, mimeType);
    const ai = getAI();
    const hasShutters = zones.some(z => z.name.toLowerCase().includes('shutter'));
    const hasTrim = zones.some(z => z.name.toLowerCase().includes('trim'));
    const hasGarage = zones.some(z => z.name.toLowerCase().includes('garage'));

    const exclusions = ['windows', 'doors', 'gutters', 'roof', 'sky', 'trees', 'shadows', 'lawn'];
    if (!hasShutters) exclusions.push('shutters');
    if (!hasTrim) exclusions.push('trim');
    if (!hasGarage) exclusions.push('garage doors');

    const hasVerticalZones = zones.some(z => z.style === 'vertical');

    let prompt = `You are a strict, precise material-replacement engine mapping new textures onto a residential home.\n\nApply ONLY these changes:\n`;
    zones.forEach(z => {
      const profileDesc = z.textureStyle && TEXTURE_PROFILE_DESCRIPTIONS[z.textureStyle]
        ? ` [PROFILE: ${TEXTURE_PROFILE_DESCRIPTIONS[z.textureStyle]}]`
        : z.style === 'vertical'
          ? ` [VERTICAL STYLE: render as tall vertical boards running floor-to-eave, not horizontal laps]`
          : '';
      prompt += `• ${z.name}: ${z.lineName} "${z.colorName}" — ${z.hue} (hex ref: ${z.colorHex})${profileDesc}\n`;
    });
    prompt += `\nCRITICAL RULES:
1. PRESERVATION: You MUST strictly map the new siding to the existing house geometry. DO NOT alter the structural layout, camera perspective, or aspect ratio.
2. NEGATIVE CONSTRAINTS: DO NOT add, remove, or modify ${exclusions.join(', ')}. Leave them 100% untouched.
3. RENOVATION SURFACES: If the house exterior contains brick, stone, masonry, stucco, or EIFS/synthetic stucco walls, treat them as viable siding surfaces for this renovation visualization — apply the selected siding product naturally over those wall areas as if new siding is being installed. Only preserve these materials on decorative accents, chimneys, or foundation bases that are clearly not part of the main wall cladding.
4. SCALE: The siding board width must accurately match the scale of the house in the photograph.${hasVerticalZones ? '\n5. VERTICAL SIDING: For zones marked [VERTICAL STYLE], render siding as distinct vertical boards (and narrow battens if Board & Batten style) running from top to bottom of each wall section. Do NOT render horizontal laps on these zones.' : ''}
${hasVerticalZones ? '6' : '5'}. LIGHTING: Keep the exact same sunlight, shadows, and lighting direction as the original photo.
${hasVerticalZones ? '7' : '6'}. PHOTOREALISM: The result must be pristine and professional. No AI artifacts, melting edges, or blurriness.`;

    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [{ inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }, { text: prompt }] },
    }), 90_000, 'quick-render');

    let resultImage: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) { resultImage = `data:image/png;base64,${(part as any).inlineData.data}`; break; }
    }
    if (!resultImage) return res.status(500).json({ error: 'AI model did not return an image. Please try again.' });
    res.json({ resultImage });
  } catch (err: any) {
    console.error('[quick-render] error:', err?.message);
    const msg = (err?.message || '').toLowerCase();
    let errorMessage = 'Quick render failed. Please try again.';
    if (msg.includes('quota')) errorMessage = 'API quota exceeded.';
    else if (msg.includes('safety')) errorMessage = 'Image flagged by safety filters.';
    else if (err?.message) errorMessage = `Generation failed: ${err.message}`;
    res.status(500).json({ error: errorMessage });
  }
});

// ── POST /generate ───────────────────────────────────────────────────────────
interface SectionData {
  id: string; name: string; maskData: string | null;
  selectedLine: { tier: string; line: string; material: string };
  selectedColor: { name: string; hex: string; hue: string };
  maskTarget: string;
}

app.post('/generate', generationLimiter, async (req, res) => {
  const { imageBase64, sections, lightingCondition, isHighQuality, imageSize, mimeType: srcMimeType } = req.body;
  if (!imageBase64 || !sections?.length) {
    return res.status(400).json({ error: 'Missing required fields: imageBase64, sections.' });
  }

  try {
    validateImagePayload(imageBase64, srcMimeType);
    const ai = getAI();
    const parts: any[] = [
      { inlineData: { data: imageBase64, mimeType: srcMimeType || 'image/jpeg' } },
    ];

    let promptText = `You are an expert architectural visualizer. Modify this house image according to the following section specifications:`;

    (sections as SectionData[]).forEach((section, index) => {
      if (section.maskData) {
        const maskBase64 = section.maskData.includes(',') ? section.maskData.split(',')[1] : section.maskData;
        parts.push({ inlineData: { data: maskBase64, mimeType: 'image/jpeg' } });
        promptText += `\n\nSECTION ${index + 1} (${section.name}):
- Target Area: Defined by the provided mask image #${index + 1} (where white is the target).
- Material: ${section.selectedLine.line} ${section.selectedLine.material}
- Color: ${section.selectedColor.name} — ${section.selectedColor.hue} (Hex reference: ${section.selectedColor.hex})`;
      }
    });

    promptText += `\n\nCRITICAL INSTRUCTIONS:
1. HARD BOUNDARIES: Treat the provided white masks as ABSOLUTE constraints.
2. GEOMETRIC PRESERVATION: You MUST preserve the exact geometric structure, structural lines, perspective, lighting direction, and surrounding environment.
3. NEGATIVE CONSTRAINTS: DO NOT TOUCH or alter roof shingles, window glass, door glass, gutters, downspouts, landscaping, driveways, or sky unless explicitly covered by a white mask.
4. LIGHTING INTEGRITY: Apply a ${lightingCondition?.toLowerCase() || 'natural'} lighting condition to the siding, but respect the original shadow map.
5. SCALE: Ensure the siding laps/boards are correctly scaled relative to the distance of the house.
6. PHOTOREALISM: The applied siding must look like a high-end architectural photo.`;

    parts.push({ text: promptText });

    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts },
    }), 120_000, 'generate');

    let resultImage: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        resultImage = `data:image/png;base64,${(part as any).inlineData.data}`;
        break;
      }
    }

    if (!resultImage) {
      return res.status(500).json({ error: 'Failed to generate the visualized image. Please try again.' });
    }

    res.json({ resultImage });
  } catch (err: any) {
    console.error('[generate] error:', err?.message);
    let errorMessage = 'Something went wrong. Please try again.';
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('quota')) errorMessage = 'API quota exceeded.';
    else if (msg.includes('not found')) errorMessage = 'AI model not found.';
    else if (msg.includes('safety')) errorMessage = 'Image flagged by safety filters.';
    else if (err?.message) errorMessage = `Generation failed: ${err.message}`;
    res.status(500).json({ error: errorMessage });
  }
});

// ── POST /detect-sections ────────────────────────────────────────────────────
app.post('/detect-sections', async (req, res) => {
  const { imageBase64, mimeType } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing required field: imageBase64.' });
  }

  try {
    const ai = getAI();
    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
          {
            text: `You are an expert architectural analyst specializing in residential exterior design. Analyze this house photograph and identify every DISTINCT exterior zone that a homeowner might want to apply a DIFFERENT siding color or material to.

SECTION IDENTIFICATION RULES:
- Identify ALL colorable SIDING exterior zones.
- OPTIONAL ACCENT ZONES (return separately in "optionalSections"): TRIM & ACCENTS, SHUTTERS.
- NEVER include: roof, skylights, window glass, doors, gutters, soffit, fascia, chimneys, foundation, driveway, landscaping, sky.
- Each zone must be architecturally DISTINCT.
- Order sections by prominence.

SECTION NAMING - use ONLY these canonical names:
  Main Body, Upper Gable, Lower Gable, Dormer, Garage Bay, Porch Surround, Second Story, First Story, Side Wing, Accent Band, Garage Door
  (For optional accents: Shutters, Trim, Corner Boards)

For each maskTarget: describe the zone's exact location and boundaries.

Return ONLY valid JSON matching this exact schema:
{
  "isResidentialHouse": boolean,
  "sections": [{ "name": "canonical name", "maskTarget": "precise segmentation instruction" }],
  "optionalSections": [{ "name": "canonical accent name", "maskTarget": "precise segmentation instruction" }]
}`,
          },
        ],
      },
    }), 30_000, 'detect-sections');

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed: any;
    try {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON object found');
      parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } catch {
      console.error('[detect-sections] JSON parse error. Raw:', rawText.slice(0, 300));
      return res.status(500).json({ error: 'AI returned an invalid format. Please try a clearer image.' });
    }

    if (parsed.isResidentialHouse === false) {
      return res.status(400).json({ error: 'PREFLIGHT_FAILURE: Not a residential house.' });
    }

    const EXCLUDED_NAMES = ['front door', 'entry door', 'side door', 'door'];
    const OPTIONAL_NAMES = ['shutters', 'trim', 'corner boards'];

    parsed.sections = (parsed.sections || []).filter(
      (s: any) => !EXCLUDED_NAMES.some(ex => s.name.toLowerCase().includes(ex))
    );

    const primarySections = parsed.sections.filter(
      (s: any) => !OPTIONAL_NAMES.some(opt => s.name.toLowerCase().includes(opt))
    );
    const accentFromSections = parsed.sections.filter(
      (s: any) => OPTIONAL_NAMES.some(opt => s.name.toLowerCase().includes(opt))
    );
    const rawOptional = parsed.optionalSections || [];
    const filteredOptional = rawOptional.filter(
      (s: any) => !EXCLUDED_NAMES.some(ex => s.name.toLowerCase().includes(ex))
    );
    const allOptional = [...accentFromSections, ...filteredOptional];
    const seenOpt = new Set<string>();
    const uniqueOptional = allOptional.filter((s: any) => {
      const key = s.name.toLowerCase();
      if (seenOpt.has(key)) return false;
      seenOpt.add(key);
      return true;
    });

    res.json({ sections: primarySections, optionalSections: uniqueOptional });
  } catch (err: any) {
    console.error('[detect-sections] error:', err?.message);
    res.status(500).json({ error: err?.message || 'Section detection failed.' });
  }
});

// ── POST /enhance-image ──────────────────────────────────────────────────────
app.post('/enhance-image', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

  try {
    validateImagePayload(imageBase64, mimeType);
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          {
            text: `You are an image preparation specialist for a residential siding visualizer tool. Transform this home exterior photo to be OPTIMAL for AI-powered siding replacement.

REMOVE: vehicles, people, pets, large tree limbs blocking siding.
PRESERVE: roofline, windows, doors, trim, foundation, porch, railings, columns, proportions.
OPTIMIZE: brightness, contrast, colors (neutral), sharpness.
Output a single photorealistic, clean, well-lit home exterior photo.`,
          },
        ],
      }],
      config: { responseModalities: ['IMAGE', 'TEXT'], temperature: 0.2 } as any,
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    let enhancedBase64: string | null = null;
    let outMime = 'image/png';

    for (const part of parts) {
      if ((part as any).inlineData?.data) {
        const id = (part as any).inlineData;
        enhancedBase64 = id.data;
        outMime = id.mimeType ?? 'image/png';
        break;
      }
    }

    if (!enhancedBase64) {
      return res.status(500).json({ error: 'Gemini did not return an enhanced image.' });
    }

    res.json({ enhancedImageBase64: enhancedBase64, mimeType: outMime });
  } catch (err: any) {
    console.error('enhance-image error:', err?.message);
    res.status(500).json({ error: err?.message || 'Enhancement failed.' });
  }
});

// ── POST /quote-request ──────────────────────────────────────────────────────
interface DesignSpec {
  mode: string; primaryLine?: string; primaryColor?: string; primaryHex?: string;
  shutters?: string | null; trim?: string | null;
  sections?: { name: string; line: string; color: string; hex: string }[];
}

app.post('/quote-request', standardLimiter, async (req, res) => {
  const { name, email, phone, address, zipCode, contactTime, projectTimeline, referralSource, notes, designSpec } = req.body;

  if (!name || !email || !phone || !address || !zipCode) {
    return res.status(422).json({ error: 'Please fill in all required fields.' });
  }

  console.log(`[quote-request] New lead: ${name} <${email}> ${phone} — ${address} ${zipCode}`);
  res.json({ success: true });

  // Fire emails in background
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (RESEND_KEY) {
    const resend = new Resend(RESEND_KEY);
    const FROM = process.env.RESEND_FROM || 'BlueprintEnvision <onboarding@resend.dev>';
    const TO = process.env.LEAD_EMAIL || 'drewhufnagle@gmail.com';

    resend.emails.send({
      from: FROM, to: [TO],
      subject: `🏠 New Quote Request — ${name}`,
      html: `<p>New lead from BlueprintEnvision: ${name} (${email}, ${phone}) at ${address} ${zipCode}</p>`,
    }).catch((err: any) => console.error('[quote-request] Email error:', err?.message));
  }
});

// ── Stripe endpoints ────────────────────────────────────────────────────────

const PLANS: Record<string, { name: string; price: number; interval: 'month' | 'year'; features: string[] }> = {
  starter: { name: 'BlueprintEnvision Starter', price: 9900, interval: 'month', features: ['100 AI visualizations/mo', '1 team member', 'Quick Mode', 'Lead capture'] },
  pro: { name: 'BlueprintEnvision Pro', price: 24900, interval: 'month', features: ['500 AI visualizations/mo', '3 team members', 'Quick + Advanced Mode', 'Custom branding'] },
};

const stripePriceCache: Record<string, string> = {};

async function getOrCreateStripePrice(stripe: Stripe, planKey: string): Promise<string> {
  if (stripePriceCache[planKey]) return stripePriceCache[planKey];
  const plan = PLANS[planKey];
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);

  const products = await stripe.products.search({ query: `metadata["plan_key"]:"${planKey}"` });
  let productId: string;
  if (products.data.length > 0) {
    productId = products.data[0].id;
    const prices = await stripe.prices.list({ product: productId, active: true, limit: 1 });
    if (prices.data.length > 0) { stripePriceCache[planKey] = prices.data[0].id; return prices.data[0].id; }
  } else {
    const product = await stripe.products.create({ name: plan.name, metadata: { plan_key: planKey } });
    productId = product.id;
  }
  const price = await stripe.prices.create({ product: productId, unit_amount: plan.price, currency: 'usd', recurring: { interval: plan.interval } });
  stripePriceCache[planKey] = price.id;
  return price.id;
}

app.get('/stripe/plans', (_req, res) => {
  const plans = Object.entries(PLANS).map(([key, plan]) => ({ key, name: plan.name, price: plan.price / 100, interval: plan.interval, features: plan.features }));
  res.json({ plans });
});

app.post('/stripe/create-checkout', standardLimiter, async (req, res) => {
  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) return res.status(503).json({ error: 'Billing not configured.' });
  const stripe = new Stripe(STRIPE_KEY);

  const { plan, email } = req.body;
  if (!plan || !PLANS[plan]) return res.status(400).json({ error: 'Invalid plan.' });

  try {
    const priceId = await getOrCreateStripePrice(stripe, plan);
    const baseUrl = process.env.APP_BASE_URL || 'https://blueprintaiconsulting.github.io/blueprint-envision';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/app?session_id={CHECKOUT_SESSION_ID}&welcome=true`,
      cancel_url: `${baseUrl}/#pricing`,
      ...(email ? { customer_email: email } : {}),
      subscription_data: { trial_period_days: 14, metadata: { plan } },
      metadata: { plan },
    });
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe] Checkout error:', err?.message);
    res.status(500).json({ error: err?.message || 'Failed to create checkout session.' });
  }
});

app.post('/stripe/portal', standardLimiter, async (req, res) => {
  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) return res.status(503).json({ error: 'Billing not configured.' });
  const stripe = new Stripe(STRIPE_KEY);

  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId.' });

  try {
    const baseUrl = process.env.APP_BASE_URL || 'https://blueprintaiconsulting.github.io/blueprint-envision';
    const portalSession = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${baseUrl}/app` });
    res.json({ url: portalSession.url });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create portal session.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//   Export as Firebase Cloud Function
// ══════════════════════════════════════════════════════════════════════════════

export const api = onRequest(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300,   // AI image generation can take up to 2 min
    maxInstances: 10,
    secrets: [geminiApiKey, resendApiKey, stripeSecretKey, stripeWebhookSecret, leadEmail, resendFrom],
  },
  app
);
