import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY is not set in the environment variables.');
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });

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

export const detectSections = async (imageBase64: string, mimeType: string = 'image/jpeg') => {
  validateImagePayload(imageBase64, mimeType);
  const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { data: rawBase64, mimeType: mimeType } },
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
}`
        }
      ]
    }
  });

  const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: { isResidentialHouse: boolean; sections: { name: string; maskTarget: string }[], optionalSections?: { name: string; maskTarget: string }[] };
  try {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found");
    const jsonString = cleaned.substring(firstBrace, lastBrace + 1);
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('AI returned an invalid format. Please try a clearer image.');
  }

  if (parsed.isResidentialHouse === false) {
    throw new Error('PREFLIGHT_FAILURE: The uploaded image does not appear to be a residential house or building suitable for siding. Please upload a clear exterior photo.');
  }

  const EXCLUDED_NAMES = ['front door', 'entry door', 'side door', 'door'];
  const OPTIONAL_NAMES = ['shutters', 'trim', 'corner boards'];

  parsed.sections = (parsed.sections || []).filter(s => !EXCLUDED_NAMES.some(ex => s.name.toLowerCase().includes(ex)));
  
  const primarySections = parsed.sections.filter(s => !OPTIONAL_NAMES.some(opt => s.name.toLowerCase().includes(opt)));
  const accentFromSections = parsed.sections.filter(s => OPTIONAL_NAMES.some(opt => s.name.toLowerCase().includes(opt)));
  const rawOptional = parsed.optionalSections || [];
  const filteredOptional = rawOptional.filter(s => !EXCLUDED_NAMES.some(ex => s.name.toLowerCase().includes(ex)));
  const allOptional = [...accentFromSections, ...filteredOptional];
  
  const seenOpt = new Set<string>();
  const uniqueOptional = allOptional.filter(s => {
    const key = s.name.toLowerCase();
    if (seenOpt.has(key)) return false;
    seenOpt.add(key);
    return true;
  });

  return { sections: primarySections, optionalSections: uniqueOptional };
};

type TextureStyleKey = 'horizontal-lap' | 'dutch-lap' | 'board-batten' | 'shake';
interface QuickZoneData { name: string; lineName: string; colorName: string; colorHex: string; hue: string; style?: 'horizontal' | 'vertical'; textureStyle?: TextureStyleKey; }

const TEXTURE_PROFILE_DESCRIPTIONS: Record<TextureStyleKey, string> = {
  'horizontal-lap':  'traditional horizontal lap clapboard siding — planks run parallel to ground with a slight bottom reveal on each course',
  'dutch-lap':       'Dutch lap (dutchlap) horizontal siding — each plank has a distinctive concave scoop routed at the top edge creating a shadow line',
  'board-batten':    'vertical board-and-batten siding — wide vertical boards separated by narrow battens running continuously from foundation to eave',
  'shake':           'staggered cedar perfection shingle siding — squared-edge cedar shingles in overlapping horizontal rows with visible individual shingle units',
};

export const quickRender = async (imageBase64: string, mimeType: string, zones: QuickZoneData[]) => {
  validateImagePayload(imageBase64, mimeType);
  const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

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

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ inlineData: { data: rawBase64, mimeType: mimeType || 'image/jpeg' } }, { text: prompt }] },
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  let resultImage: string | null = null;
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) { resultImage = `data:image/png;base64,${part.inlineData.data}`; break; }
  }
  
  if (!resultImage) throw new Error('AI model did not return an image. Please try again.');
  return resultImage;
};

export const roofQuickRender = async (imageBase64: string, mimeType: string, zones: any[]) => {
  validateImagePayload(imageBase64, mimeType);
  const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  let prompt = `You are a strict, precise material-replacement engine mapping new textures onto a residential roof.\n\nApply ONLY these changes:\n`;
  zones.forEach(z => {
    prompt += `• ${z.name}: ${z.productName} "${z.colorName}" — ${z.hue} (hex ref: ${z.colorHex}) [Material: ${z.materialType}]\n`;
  });
  prompt += `\nCRITICAL RULES:
1. PRESERVATION: You MUST strictly map the new roofing to the existing roof geometry. DO NOT alter the structural layout, camera perspective, or aspect ratio.
2. NEGATIVE CONSTRAINTS: DO NOT add, remove, or modify siding, windows, doors, gutters, sky, trees, shadows, or lawn. Leave them 100% untouched.
3. SCALE: The shingle scale must accurately match the scale of the house in the photograph.
4. LIGHTING: Keep the exact same sunlight, shadows, and lighting direction as the original photo.
5. PHOTOREALISM: The result must be pristine and professional. No AI artifacts, melting edges, or blurriness.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ inlineData: { data: rawBase64, mimeType: mimeType || 'image/jpeg' } }, { text: prompt }] },
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  let resultImage: string | null = null;
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) { resultImage = `data:image/png;base64,${part.inlineData.data}`; break; }
  }
  
  if (!resultImage) throw new Error('AI model did not return an image. Please try again.');
  return resultImage;
};

export const enhanceImage = async (imageBase64: string, mimeType: string = 'image/jpeg') => {
  validateImagePayload(imageBase64, mimeType);
  const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: rawBase64 } },
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
    if ((part as any).inlineData?.data) {
      enhancedBase64 = (part as any).inlineData.data;
      outMime = (part as any).inlineData.mimeType ?? 'image/png';
      break;
    }
  }

  if (!enhancedBase64) throw new Error('Gemini did not return an enhanced image. Try a different photo.');
  return { enhancedImageBase64: enhancedBase64, mimeType: outMime };
};
