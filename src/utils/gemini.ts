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

  const text = response.text || '';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  const data = JSON.parse(cleaned);

  if (data.isResidentialHouse === false) {
    throw new Error('This image does not appear to be a residential house. Please upload a clear photo of a house exterior.');
  }

  return {
    sections: data.sections || [],
    optionalSections: data.optionalSections || []
  };
};

export const autoMask = async (imageBase64: string, mimeType: string = 'image/jpeg', maskTarget: string): Promise<string> => {
  validateImagePayload(imageBase64, mimeType);
  const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const targetLower = maskTarget.toLowerCase();
  const allExclusions = ['roof', 'windows', 'window frames', 'shutters', 'doors', 'garage doors', 'trim', 'gutters', 'downspouts', 'fascia', 'soffits', 'foundation', 'concrete', 'sky', 'grass', 'trees', 'plants', 'people', 'vehicles', 'shadows'];
  const activeExclusions = allExclusions.filter(e => !targetLower.includes(e));

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        { inlineData: { data: rawBase64, mimeType: mimeType || 'image/jpeg' } },
        {
          text: `Create a pixel-perfect, high-contrast binary segmentation mask (black and white only) for the following target: "${maskTarget}".

CRITICAL RULES:
1. The ${maskTarget} MUST be PURE WHITE (#FFFFFF).
2. EVERYTHING ELSE MUST be PURE BLACK (#000000).
3. EXCLUDE: ${activeExclusions.join(', ')}.
4. SHARP EDGES: Ensure the mask has crisp, sharp boundaries. NO BLUR, NO GRADIENTS, NO GRAYSCALE.
5. ACCURACY: Carefully follow the architectural lines of the house.
6. OUTPUT: Return only a flat, 2D black and white silhouette mask image.`
        }
      ]
    },
    config: { responseModalities: ['IMAGE', 'TEXT'] }
  });

  let maskBase64 = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      maskBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!maskBase64) throw new Error('AI model did not return a mask image.');
  return maskBase64;
};

type TextureStyleKey = 'horizontal-lap' | 'dutch-lap' | 'board-batten' | 'shake';
export interface QuickZoneData {
  name: string;
  lineName: string;
  colorName: string;
  colorHex: string;
  hue: string;
  style?: 'horizontal' | 'vertical';
  textureStyle?: TextureStyleKey;
}

const TEXTURE_PROFILE_DESCRIPTIONS: Record<TextureStyleKey, string> = {
  'horizontal-lap':  'traditional horizontal lap clapboard siding — planks run parallel to ground with a slight bottom reveal on each course',
  'dutch-lap':       'Dutch lap (dutchlap) horizontal siding — each plank has a distinctive concave scoop routed at the top edge creating a shadow line',
  'board-batten':    'vertical board-and-batten siding — wide vertical boards separated by narrow battens running continuously from foundation to eave',
  'shake':           'staggered cedar perfection shingle siding — squared-edge cedar shingles in overlapping horizontal rows with visible individual shingle units',
};

export const quickRender = async (imageBase64: string, mimeType: string, zones: QuickZoneData[]): Promise<string> => {
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

export const generateSiding = async (
  imageBase64: string,
  mimeType: string,
  sections: Array<{
    name: string;
    maskData: string | null;
    selectedLine: { line: string; material: string };
    selectedColor: { name: string; hex: string; hue: string };
  }>,
  lightingCondition: string = 'Natural Daylight'
): Promise<string> => {
  validateImagePayload(imageBase64, mimeType);
  const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  const parts: any[] = [
    { inlineData: { data: rawBase64, mimeType: mimeType || 'image/jpeg' } },
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

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts },
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  let resultImage: string | null = null;
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      resultImage = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!resultImage) {
    throw new Error('Failed to generate the visualized image. Please try again.');
  }

  return resultImage;
};

export const enhanceImage = async (imageBase64: string, mimeType: string = 'image/jpeg'): Promise<{ enhancedImageBase64: string; mimeType: string }> => {
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
