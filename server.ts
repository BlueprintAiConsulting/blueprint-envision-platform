/**
 * Blueprint AI — API Proxy Server
 *
 * Holds the GEMINI_API_KEY server-side so it is never exposed in the
 * client bundle. The frontend calls /api/* and this server forwards the
 * requests to the Gemini API.
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import cors from 'cors';
import Stripe from 'stripe';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// SECURITY NOTE: 'trust proxy' 1 relies on Render's proxy to correctly supply client IPs for the rate limiter.
// If this architecture expands to place a CDN (like Cloudflare) IN FRONT of Render, this value MUST 
// be increased to 'trust proxy', 2 (or higher) relative to the proxy depth to prevent IP-spoofed rate limit bypass.
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://blueprint-siding-visualizer.onrender.com',
  'https://blueprint-envision-platform.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '50mb' }));

const PORT = Number(process.env.PORT || process.env.SERVER_PORT) || 3002;

if (!process.env.GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set. Add it to your .env file.');
  process.exit(1);
}

// Single, server-side AI client — key never leaves the server
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------------------------------------------------------------------------
// Rate limiters to prevent quota drain and spam
// ---------------------------------------------------------------------------
const generationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 generation requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment before trying again.' }
});

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' }
});


// Utility: wrap a promise with a timeout to prevent hung API calls
const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)),
  ]);

// Utility: Server-side validation for image pre-flight checks before hitting Gemini
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

// ---------------------------------------------------------------------------
// POST /api/auto-mask
// Body: { imageBase64: string, mimeType: string, maskTarget: string }
// Returns: { maskBase64: string }
// ---------------------------------------------------------------------------
app.post('/api/auto-mask', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType, maskTarget } = req.body as {
    imageBase64: string;
    mimeType: string;
    maskTarget: string;
  };

  if (!imageBase64 || !maskTarget) {
    return res.status(400).json({ error: 'Missing required fields: imageBase64, maskTarget.' });
  }

  try {
    validateImagePayload(imageBase64, mimeType);
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
      if (part.inlineData) {
        maskBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
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

// ---------------------------------------------------------------------------
// POST /api/quick-render
// Body: { imageBase64, mimeType, zones: [{name, lineName, colorName, colorHex, hue}] }
// Returns: { resultImage: string }
// One-shot generation — no masks required, ~45s total.
// ---------------------------------------------------------------------------
type TextureStyleKey = 'horizontal-lap' | 'dutch-lap' | 'board-batten' | 'shake';
interface QuickZoneData { name: string; lineName: string; colorName: string; colorHex: string; hue: string; style?: 'horizontal' | 'vertical'; textureStyle?: TextureStyleKey; }

const TEXTURE_PROFILE_DESCRIPTIONS: Record<TextureStyleKey, string> = {
  'horizontal-lap':  'traditional horizontal lap clapboard siding — planks run parallel to ground with a slight bottom reveal on each course',
  'dutch-lap':       'Dutch lap (dutchlap) horizontal siding — each plank has a distinctive concave scoop routed at the top edge creating a shadow line',
  'board-batten':    'vertical board-and-batten siding — wide vertical boards separated by narrow battens running continuously from foundation to eave',
  'shake':           'staggered cedar perfection shingle siding — squared-edge cedar shingles in overlapping horizontal rows with visible individual shingle units',
};

app.post('/api/quick-render', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType, zones } = req.body as { imageBase64: string; mimeType: string; zones: QuickZoneData[] };
  if (!imageBase64 || !zones?.length) return res.status(400).json({ error: 'Missing imageBase64 or zones.' });

  try {
    validateImagePayload(imageBase64, mimeType);
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
      if (part.inlineData) { resultImage = `data:image/png;base64,${part.inlineData.data}`; break; }
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

// ---------------------------------------------------------------------------
// POST /api/generate
// Body: { imageBase64, sections, lightingCondition, isHighQuality, imageSize }
// Returns: { resultImage: string }
// ---------------------------------------------------------------------------
interface SectionData {
  id: string;
  name: string;
  maskData: string | null;
  selectedLine: { tier: string; line: string; material: string };
  selectedColor: { name: string; hex: string; hue: string };
  maskTarget: string;
}

app.post('/api/generate', generationLimiter, async (req, res) => {
  const { imageBase64, sections, lightingCondition, isHighQuality, imageSize, mimeType: srcMimeType } = req.body as {
    imageBase64: string;
    sections: SectionData[];
    lightingCondition: string;
    isHighQuality: boolean;
    imageSize: string;
    mimeType?: string;
  };

  if (!imageBase64 || !sections?.length) {
    return res.status(400).json({ error: 'Missing required fields: imageBase64, sections.' });
  }

  try {
    validateImagePayload(imageBase64, srcMimeType);
    // Build parts array — source image first
    const parts: any[] = [
      { inlineData: { data: imageBase64, mimeType: srcMimeType || 'image/jpeg' } },
    ];

    let promptText = `You are an expert architectural visualizer. Modify this house image according to the following section specifications:`;

    sections.forEach((section, index) => {
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
1. HARD BOUNDARIES: Treat the provided white masks as ABSOLUTE constraints. The new siding MUST NOT bleed over the masked boundaries into unmasked areas.
2. GEOMETRIC PRESERVATION: You are functioning as a precise material-replacement engine, NOT a creative image generator. You MUST preserve the exact geometric structure, structural lines, perspective, lighting direction, and surrounding environment of the source image.
3. NEGATIVE CONSTRAINTS: DO NOT TOUCH or alter roof shingles, window glass, door glass, gutters, downspouts, landscaping, driveways, or sky unless explicitly covered by a white mask. Shutters, trim boards, corner boards, soffits, fascia, doors, garage doors, brick, stone, masonry, stucco, and EIFS surfaces MAY all be altered if covered by a white mask.
4. LIGHTING INTEGRITY: Apply a ${lightingCondition.toLowerCase()} lighting condition to the siding, but respect the original shadow map of the house.
5. SCALE: Ensure the siding laps/boards are correctly scaled relative to the distance of the house.
6. PHOTOREALISM: The applied siding must look like a high-end architectural photo, avoiding any blurry "AI generation" artifacts.`;

    parts.push({ text: promptText });

    // Standardizing on the proper experimental image generation endpoint
    const modelName = 'gemini-3.1-flash-image-preview';

    const response = await withTimeout(ai.models.generateContent({
      model: modelName,
      contents: { parts },
    }), 120_000, 'generate');

    let resultImage: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        resultImage = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!resultImage) {
      return res.status(500).json({ error: 'Failed to generate the visualized image. Please try again.' });
    }

    res.json({ resultImage });
  } catch (err: any) {
    console.error('[generate] error:', err?.message);

    let errorMessage = 'Something went wrong while processing the image. Please try again.';
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (msg.includes('not found')) {
      errorMessage = 'AI model not found. Please verify the model name configuration.';
    } else if (msg.includes('safety')) {
      errorMessage = 'The image was flagged by safety filters. Please try another image.';
    } else if (err?.message) {
      errorMessage = `Generation failed: ${err.message}`;
    }

    res.status(500).json({ error: errorMessage });
  }
});

// ---------------------------------------------------------------------------
// POST /api/detect-sections
// Body: { imageBase64: string, mimeType: string }
// Returns: { sections: { name: string, maskTarget: string }[] }
// Uses a text model to analyze the house and identify distinct siding zones.
// Each zone's maskTarget is then passed to /api/auto-mask to generate its mask.
// ---------------------------------------------------------------------------
app.post('/api/detect-sections', async (req, res) => {
  const { imageBase64, mimeType } = req.body as {
    imageBase64: string;
    mimeType: string;
  };

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing required field: imageBase64.' });
  }

  try {
    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
          {
            text: `You are an expert architectural analyst specializing in residential exterior design. Analyze this house photograph and identify every DISTINCT exterior zone that a homeowner might want to apply a DIFFERENT siding color or material to.

SECTION IDENTIFICATION RULES:
- Identify ALL colorable SIDING exterior zones:
  * SIDING surfaces: horizontal lap siding, vertical board siding, vinyl panels, fiber cement, wood clapboard, composite siding, AND any brick, stone, masonry, or stucco walls (common renovation targets).
  * GARAGE DOOR: if present and colorable, include as its own zone.
- OPTIONAL ACCENT ZONES (return separately in "optionalSections"):
  * TRIM & ACCENTS: trim boards, corner boards, window trim, door trim, frieze boards — group all matching trim as one zone.
  * SHUTTERS: decorative or functional shutters — group all matching shutters on the house as one unified zone.
- NEVER include: roof shingles/tiles, skylights, window glass panes, door glass, front door, entry door, side doors, gutters and downspouts, soffit, fascia, chimneys, foundation/concrete base, driveway, landscaping, sky, people, or vehicles.
- Each zone must be architecturally DISTINCT: on a different plane, separated by a physical break, or clearly a different element type.
- Return ALL distinct zones you identify — there is no maximum. If one continuous siding surface exists, return only 1.
- Order sections by prominence (largest/most visible siding first).

SECTION NAMING - use ONLY these canonical names:
  Main Body, Upper Gable, Lower Gable, Dormer, Garage Bay, Porch Surround, Second Story, First Story, Side Wing, Accent Band, Garage Door
  (For optional accents: Shutters, Trim, Corner Boards)
  (If none fit, use a concise 2-3 word descriptive name.)

For each maskTarget: describe the zone's exact location and boundaries, referencing neighboring elements as exclusion anchors (e.g. "all decorative shutters flanking windows on the main facade" or "trim boards along window and door frames, excluding window glass and siding").

CRITICAL PRE-FLIGHT CHECK: First, determine if the image actually contains a residential house or building.

Return ONLY valid JSON - no markdown, no code fences, no explanation, matching this exact schema:
{
  "isResidentialHouse": boolean,
  "sections": [
    {
      "name": "canonical name",
      "maskTarget": "precise segmentation instruction for this zone"
    }
  ],
  "optionalSections": [
    {
      "name": "canonical accent name (Shutters, Trim, Corner Boards)",
      "maskTarget": "precise segmentation instruction for this accent zone"
    }
  ]
}`,
          },
        ],
      },
    }), 30_000, 'detect-sections');

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if present
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed: { isResidentialHouse: boolean; sections: { name: string; maskTarget: string }[] };
    try {
      // Find the first '{' and last '}' to handle potential wrap-around text
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found");
      const jsonString = cleaned.substring(firstBrace, lastBrace + 1);
      
      parsed = JSON.parse(jsonString);
    } catch {
      console.error('[detect-sections] JSON parse error. Raw:', rawText.slice(0, 300));
      return res.status(500).json({ error: 'AI returned an invalid format. Please try a clearer image.' });
    }

    if (parsed.isResidentialHouse === false) {
      return res.status(400).json({ error: 'PREFLIGHT_FAILURE: The uploaded image does not appear to be a residential house or building suitable for siding. Please upload a clear exterior photo.' });
    }

    // Filter out any front door / entry door zones the AI may have returned despite instructions
    const EXCLUDED_NAMES = ['front door', 'entry door', 'side door', 'door'];
    const OPTIONAL_NAMES = ['shutters', 'trim', 'corner boards'];

    // Remove excluded zones entirely
    parsed.sections = (parsed.sections || []).filter(
      s => !EXCLUDED_NAMES.some(ex => s.name.toLowerCase().includes(ex))
    );

    // Separate any accent zones the AI put in sections instead of optionalSections
    const primarySections = parsed.sections.filter(
      s => !OPTIONAL_NAMES.some(opt => s.name.toLowerCase().includes(opt))
    );
    const accentFromSections = parsed.sections.filter(
      s => OPTIONAL_NAMES.some(opt => s.name.toLowerCase().includes(opt))
    );

    // Merge with the dedicated optionalSections array (also filtering excluded names)
    const rawOptional = (parsed as any).optionalSections || [];
    const filteredOptional = rawOptional.filter(
      (s: any) => !EXCLUDED_NAMES.some(ex => s.name.toLowerCase().includes(ex))
    );
    const allOptional = [...accentFromSections, ...filteredOptional];
    // De-duplicate by name
    const seenOpt = new Set<string>();
    const uniqueOptional = allOptional.filter(s => {
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

// ---------------------------------------------------------------------------
// Resend email client — zero SMTP config, just an API key.
// Sign up free at resend.com → API Keys → Create Key → add as RESEND_API_KEY.
// If not set, emails are skipped but leads are still logged to console.
// ---------------------------------------------------------------------------
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!resend) console.warn('⚠️  RESEND_API_KEY not set — emails will be skipped. Leads still logged to console.');

// ---------------------------------------------------------------------------
// POST /api/quote-request
// Accepts homeowner contact info + design spec, sends lead email to BlueprintEnvision
// and a confirmation to the homeowner.
// ---------------------------------------------------------------------------
interface DesignSpec {
  mode: string;
  primaryLine?: string;
  primaryColor?: string;
  primaryHex?: string;
  shutters?: string | null;
  trim?: string | null;
  sections?: { name: string; line: string; color: string; hex: string }[];
}

app.post('/api/quote-request', standardLimiter, async (req, res) => {
  const { name, email, phone, address, zipCode, contactTime, projectTimeline, referralSource, notes, designSpec } =
    req.body as {
      name: string; email: string; phone: string; address: string; zipCode: string;
      contactTime: string; projectTimeline: string; referralSource: string; notes: string;
      designSpec: DesignSpec;
    };

  if (!name || !email || !phone || !address || !zipCode) {
    return res.status(422).json({ error: 'Please fill in all required fields.' });
  }

  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' });

  // Build design spec HTML rows
  const buildDesignHtml = (spec: DesignSpec): string => {
    if (spec.mode === 'Quick') {
      return `
        <tr><td style="padding:6px 0;color:#64748B;width:140px">Primary Siding</td>
          <td><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${spec.primaryHex};vertical-align:middle;margin-right:6px"></span>
          <strong>${spec.primaryLine}</strong> — ${spec.primaryColor}</td></tr>
        ${spec.shutters ? `<tr><td style="padding:6px 0;color:#64748B">Shutters</td><td>${spec.shutters}</td></tr>` : ''}
        ${spec.trim ? `<tr><td style="padding:6px 0;color:#64748B">Trim</td><td>${spec.trim}</td></tr>` : ''}
      `;
    }
    return (spec.sections || []).map(s => `
      <tr><td style="padding:6px 0;color:#64748B;width:140px">${s.name}</td>
        <td><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${s.hex};vertical-align:middle;margin-right:6px"></span>
        <strong>${s.line}</strong> — ${s.color}</td></tr>
    `).join('');
  };

  const leadEmailHtml = `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:620px;margin:24px auto">
  <div style="background:#0F172A;padding:24px 28px;border-radius:12px 12px 0 0">
    <div style="color:#60A5FA;font-size:18px;font-weight:bold;letter-spacing:2px">BLUEPRINTENVISION</div>
    <div style="color:#94A3B8;font-size:13px;margin-top:4px">New Lead — BlueprintEnvision Exteriors</div>
  </div>
  <div style="background:white;padding:28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0">
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:14px;margin-bottom:22px">
      <strong style="color:#C2410C">🔔 New Quote Request</strong>
      <p style="margin:6px 0 0;color:#9A3412;font-size:14px">A homeowner completed a visualization and requested a free estimate.</p>
    </div>
    <h3 style="color:#1E293B;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px">Contact Details</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px">
      <tr><td style="padding:6px 0;color:#64748B;width:140px">Name</td><td><strong>${name}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#64748B">Email</td><td><a href="mailto:${email}" style="color:#3B82F6">${email}</a></td></tr>
      <tr><td style="padding:6px 0;color:#64748B">Phone</td><td><a href="tel:${phone}" style="color:#3B82F6">${phone}</a></td></tr>
      <tr><td style="padding:6px 0;color:#64748B">Address</td><td>${address}, ${zipCode}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B">Best Time</td><td>${contactTime}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B">Timeline</td><td>${projectTimeline}</td></tr>
      <tr><td style="padding:6px 0;color:#64748B">Found Us Via</td><td>${referralSource}</td></tr>
    </table>
    ${notes ? `<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:12px;margin-bottom:22px;font-size:14px;color:#334155;font-style:italic">&ldquo;${notes}&rdquo;</div>` : ''}
    <h3 style="color:#1E293B;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px">Visualized Design — ${designSpec.mode} Mode</h3>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin-bottom:22px">
      <table style="width:100%;border-collapse:collapse">${buildDesignHtml(designSpec)}</table>
    </div>
    <a href="mailto:${email}?subject=Re%3A%20Your%20BlueprintEnvision%20Quote%20Request" style="display:inline-block;background:#3B82F6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">Reply to ${name} →</a>
  </div>
  <div style="background:#0F172A;padding:14px 28px;border-radius:0 0 12px 12px;text-align:center;color:#475569;font-size:11px">
    <p style="margin:0">Submitted via BlueprintEnvision &nbsp;·&nbsp; ${timestamp}</p>
    <p style="margin:4px 0 0">https://blueprint-envision-platform.onrender.com</p>
  </div>
</div>
</body></html>`;

  const confirmEmailHtml = `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:580px;margin:24px auto">
  <div style="background:#0F172A;padding:24px 28px;border-radius:12px 12px 0 0">
    <div style="color:#60A5FA;font-size:18px;font-weight:bold;letter-spacing:2px">BLUEPRINTENVISION</div>
    <div style="color:#94A3B8;font-size:13px;margin-top:4px">Powered by BlueprintEnvision</div>
  </div>
  <div style="background:white;padding:28px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0">
    <h2 style="color:#1E293B;margin:0 0 16px">Hi ${name}, we received your request! 👋</h2>
    <p style="color:#475569;line-height:1.6">Thank you for using BlueprintEnvision to design your home exterior. Your quote request has been received by the BlueprintEnvision Exteriors team and one of our specialists will reach out within <strong>24 business hours</strong>.</p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin:20px 0">
      <h3 style="margin:0 0 10px;color:#1E293B;font-size:13px;text-transform:uppercase;letter-spacing:1px">Your Selected Design</h3>
      <table style="width:100%;border-collapse:collapse">${buildDesignHtml(designSpec)}</table>
    </div>
    <p style="color:#64748B;font-size:13px">Questions? You can reach us directly at <a href="mailto:${process.env.LEAD_EMAIL || 'drewhufnagle@gmail.com'}" style="color:#3B82F6">${process.env.LEAD_EMAIL || 'drewhufnagle@gmail.com'}</a></p>
  </div>
  <div style="background:#0F172A;padding:14px 28px;border-radius:0 0 12px 12px;text-align:center;color:#475569;font-size:11px">
    <p style="margin:0">BlueprintEnvision Exteriors &nbsp;·&nbsp; Powered by BlueprintEnvision</p>
  </div>
</div>
</body></html>`;

  // Always log to console so no lead is silently lost even if email fails
  console.log(`[quote-request] New lead: ${name} <${email}> ${phone} — ${address} ${zipCode} — ${designSpec.mode} / ${designSpec.primaryLine || (designSpec.sections?.[0]?.line)} ${designSpec.primaryColor || (designSpec.sections?.[0]?.color)}`);

  res.json({ success: true });

  // Fire emails in the background (non-blocking)
  if (resend) {
    const FROM = process.env.RESEND_FROM || 'BlueprintEnvision <onboarding@resend.dev>';
    const hasVerifiedDomain = !!process.env.RESEND_FROM; // custom domain = verified

    resend.emails.send({
      from: FROM,
      to: [process.env.LEAD_EMAIL || 'drewhufnagle@gmail.com'],
      subject: `🏠 New Quote Request — ${name} — ${designSpec.primaryLine || designSpec.sections?.[0]?.line} ${designSpec.primaryColor || designSpec.sections?.[0]?.color}`,
      html: leadEmailHtml,
    }).then(() => console.log(`[quote-request] Lead email sent for ${email}`))
      .catch((err: any) => console.error('[quote-request] Lead email error:', err?.message));

    // Only send homeowner confirmation if we have a verified sending domain
    // (Resend free tier blocks sending to external addresses from onboarding@resend.dev)
    if (hasVerifiedDomain) {
      resend.emails.send({
        from: FROM,
        to: [email],
        subject: `Your BlueprintEnvision Quote Request — We'll Be In Touch, ${name}!`,
        html: confirmEmailHtml,
      }).then(() => console.log(`[quote-request] Confirmation email sent to ${email}`))
        .catch((err: any) => console.error('[quote-request] Confirmation email error:', err?.message));
    }
  }

});

// ---------------------------------------------------------------------------
// POST /api/enhance-image — AI Image Optimizer
// Removes obstacles (cars, people, trees blocking facade), optimizes
// brightness/contrast, and prepares image for best siding visualization.
// ---------------------------------------------------------------------------
app.post('/api/enhance-image', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body as {
    imageBase64: string;
    mimeType?: string;
  };

  if (!imageBase64) {
    res.status(400).json({ error: 'imageBase64 is required' });
    return;
  }

  try {
    validateImagePayload(imageBase64, mimeType);
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            {
              text: `You are an image preparation specialist for a residential siding visualizer tool. Transform this home exterior photo to be OPTIMAL for AI-powered siding replacement.

REMOVE these elements completely (fill with realistic background):
- All parked vehicles: cars, trucks, SUVs, motorcycles — in driveway, street, or yard
- All people and pets
- Large tree limbs or dense foliage covering more than 15% of the visible siding area
- Construction equipment, ladders, or temporary objects in front of/on the house

STRICTLY PRESERVE unchanged:
- Exact roofline shape, pitch, and silhouette
- All windows: exact size, placement, style, trim, glass
- All doors: front, garage, side — exact style and placement
- All trim: corner boards, fascia, soffits, window casings, shutters
- Foundation, porch, steps, railings, columns
- Exact house proportions and overall dimensions
- Brick, stone, or masonry accents

OPTIMIZE:
- Brightness: siding clearly visible, not overexposed or underlit
- Contrast: slightly increased to emphasize material texture
- Colors: accurate, neutral — no artistic filters, no HDR, no over-saturation
- Sharpness: crisp enough to show siding texture details

Output a single photorealistic, clean, well-lit home exterior photo preserving the exact architecture, optimized for AI siding material visualization.`,
            },
          ],
        },
      ],
      config: { responseModalities: ['IMAGE', 'TEXT'], temperature: 0.2 },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    let enhancedBase64: string | null = null;
    let outMime = 'image/png';

    for (const part of parts) {
      if ((part as { inlineData?: { data?: string; mimeType?: string } }).inlineData?.data) {
        const id = (part as { inlineData: { data: string; mimeType?: string } }).inlineData;
        enhancedBase64 = id.data;
        outMime = id.mimeType ?? 'image/png';
        break;
      }
    }

    if (!enhancedBase64) {
      res.status(500).json({ error: 'Gemini did not return an enhanced image. Try a different photo.' });
      return;
    }

    res.json({ enhancedImageBase64: enhancedBase64, mimeType: outMime });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('enhance-image error:', msg);
    res.status(500).json({ error: msg });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ping — health check / keep-alive endpoint
// Prevents Render free-tier spin-down. Hit by client every 10 min and by
// external monitors (e.g. UptimeRobot) every 5 min.
// ---------------------------------------------------------------------------
app.get('/api/ping', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), ts: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Stripe — Subscription billing for contractor SaaS
// ---------------------------------------------------------------------------
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set — billing endpoints disabled.');
}

// Plan definitions — prices are created lazily in Stripe on first checkout
const PLANS: Record<string, { name: string; price: number; interval: 'month' | 'year'; features: string[] }> = {
  starter: {
    name: 'BlueprintEnvision Starter',
    price: 9900, // $99.00 in cents
    interval: 'month',
    features: ['100 AI visualizations/mo', '1 team member', 'Quick Mode', 'Lead capture'],
  },
  pro: {
    name: 'BlueprintEnvision Pro',
    price: 24900, // $249.00 in cents
    interval: 'month',
    features: ['500 AI visualizations/mo', '3 team members', 'Quick + Advanced Mode', 'Custom branding'],
  },
};

// Cache Stripe Price IDs so we don't re-create them every checkout
const stripePriceCache: Record<string, string> = {};

async function getOrCreateStripePrice(planKey: string): Promise<string> {
  if (!stripe) throw new Error('Stripe not configured');
  if (stripePriceCache[planKey]) return stripePriceCache[planKey];

  const plan = PLANS[planKey];
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);

  // Search for existing product by metadata
  const products = await stripe.products.search({ query: `metadata["plan_key"]:"${planKey}"` });
  let productId: string;

  if (products.data.length > 0) {
    productId = products.data[0].id;
    // Find active price for this product
    const prices = await stripe.prices.list({ product: productId, active: true, limit: 1 });
    if (prices.data.length > 0) {
      stripePriceCache[planKey] = prices.data[0].id;
      return prices.data[0].id;
    }
  } else {
    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      metadata: { plan_key: planKey },
    });
    productId = product.id;
  }

  // Create price
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: plan.price,
    currency: 'usd',
    recurring: { interval: plan.interval },
  });

  stripePriceCache[planKey] = price.id;
  console.log(`[stripe] Created price ${price.id} for plan "${planKey}"`);
  return price.id;
}

// POST /api/stripe/create-checkout — Creates a Stripe Checkout session
app.post('/api/stripe/create-checkout', standardLimiter, async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Billing not configured.' });

  const { plan, email } = req.body as { plan: string; email?: string };
  if (!plan || !PLANS[plan]) return res.status(400).json({ error: 'Invalid plan. Use "starter" or "pro".' });

  try {
    const priceId = await getOrCreateStripePrice(plan);
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/app?session_id={CHECKOUT_SESSION_ID}&welcome=true`,
      cancel_url: `${baseUrl}/#pricing`,
      ...(email ? { customer_email: email } : {}),
      subscription_data: {
        trial_period_days: 14,
        metadata: { plan },
      },
      metadata: { plan },
    });

    console.log(`[stripe] Checkout session created: ${session.id} for plan "${plan}"`);
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe] Checkout error:', err?.message);
    res.status(500).json({ error: err?.message || 'Failed to create checkout session.' });
  }
});

// POST /api/stripe/webhook — Handles Stripe webhook events
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).send('Billing not configured.');

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In dev/test without webhook secret, parse directly
      event = JSON.parse(req.body.toString()) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('[stripe webhook] Signature verification failed:', err?.message);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[stripe] ✅ New subscription! Customer: ${session.customer_email}, Plan: ${session.metadata?.plan}`);
      // TODO: Create tenant record in database (Phase 3)
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[stripe] Subscription updated: ${sub.id}, Status: ${sub.status}`);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[stripe] ❌ Subscription cancelled: ${sub.id}`);
      break;
    }
    default:
      console.log(`[stripe] Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
});

// POST /api/stripe/portal — Redirects to customer billing portal
app.post('/api/stripe/portal', standardLimiter, async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Billing not configured.' });

  const { customerId } = req.body as { customerId: string };
  if (!customerId) return res.status(400).json({ error: 'Missing customerId.' });

  try {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/app`,
    });
    res.json({ url: portalSession.url });
  } catch (err: any) {
    console.error('[stripe] Portal error:', err?.message);
    res.status(500).json({ error: err?.message || 'Failed to create portal session.' });
  }
});

// GET /api/stripe/plans — Public endpoint returning available plans
app.get('/api/stripe/plans', (_req, res) => {
  const plans = Object.entries(PLANS).map(([key, plan]) => ({
    key,
    name: plan.name,
    price: plan.price / 100,
    interval: plan.interval,
    features: plan.features,
  }));
  res.json({ plans });
});

// ---------------------------------------------------------------------------
// Serve built static files in production (NODE_ENV=production)
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, response) => {
    response.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅  BlueprintEnvision API server → http://localhost:${PORT}`);

  // Self-ping every 14 min to prevent Render free-tier cold starts
  const selfUrl = process.env.RENDER_EXTERNAL_URL;
  if (selfUrl) {
    setInterval(() => {
      fetch(`${selfUrl}/api/ping`)
        .then(() => console.log('🏓 keep-alive ping sent'))
        .catch((e) => console.warn('keep-alive ping failed:', e.message));
    }, 14 * 60 * 1000); // 14 minutes
    console.log(`🏓 keep-alive pinger started → ${selfUrl}/api/ping`);
  }
});
