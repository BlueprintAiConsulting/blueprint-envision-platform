/**
 * textures.ts
 * High-fidelity CSS background styles for each material texture style.
 * Uses inline SVG patterns — no external image files required.
 * The hex color is applied as the base; the SVG adds structural surface
 * detail via mix-blend-mode in the component.
 *
 * Each pattern is designed at a scale that reads clearly even at 60-80px
 * swatch sizes — balancing realistic detail with legibility.
 */

function svgUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Returns a CSS backgroundImage for the texture overlay (neutral gray tones) */
export function getTextureOverlayCSS(style: string | undefined): string | undefined {
  switch (style) {

    // ════════════════════════════════════════════════════════════════════════
    //  ROOFING TEXTURES
    // ════════════════════════════════════════════════════════════════════════

    case 'architectural': {
      // Dimensional asphalt shingles — 3-tab stagger, granular surface,
      // shadow exposure lines, realistic per-tab tonal variation
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="56">
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="5" stitchTiles="stitch" result="n"/>
            <feColorMatrix type="saturate" values="0" in="n" result="grey"/>
            <feBlend in="SourceGraphic" in2="grey" mode="multiply"/>
          </filter>
          <linearGradient id="tabShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0.08"/>
            <stop offset="0.3" stop-color="#fff" stop-opacity="0"/>
            <stop offset="0.8" stop-color="#000" stop-opacity="0.06"/>
            <stop offset="1" stop-color="#000" stop-opacity="0.15"/>
          </linearGradient>
        </defs>
        <rect width="120" height="56" fill="#ababab"/>
        <rect x="0"  y="0" width="38" height="24" fill="#b0b0b0" rx="0.5"/>
        <rect x="40" y="0" width="36" height="24" fill="#a8a8a8" rx="0.5"/>
        <rect x="78" y="0" width="42" height="24" fill="#acacac" rx="0.5"/>
        <rect x="-12" y="28" width="34" height="24" fill="#a6a6a6" rx="0.5"/>
        <rect x="24"  y="28" width="40" height="24" fill="#b2b2b2" rx="0.5"/>
        <rect x="66"  y="28" width="32" height="24" fill="#a9a9a9" rx="0.5"/>
        <rect x="100" y="28" width="32" height="24" fill="#aeaeae" rx="0.5"/>
        <rect x="0" y="23" width="120" height="5" fill="#000" opacity="0.35"/>
        <rect x="0" y="23" width="120" height="1.5" fill="#000" opacity="0.25"/>
        <rect x="0" y="51" width="120" height="5" fill="#000" opacity="0.35"/>
        <rect x="0" y="51" width="120" height="1.5" fill="#000" opacity="0.25"/>
        <rect x="38"  y="0" width="2" height="24" fill="#666" opacity="0.35"/>
        <rect x="78"  y="0" width="2" height="24" fill="#666" opacity="0.35"/>
        <rect x="22"  y="28" width="2" height="24" fill="#666" opacity="0.35"/>
        <rect x="64"  y="28" width="2" height="24" fill="#666" opacity="0.35"/>
        <rect x="98"  y="28" width="2" height="24" fill="#666" opacity="0.35"/>
        <rect x="0"  y="0"  width="120" height="1" fill="#fff" opacity="0.12"/>
        <rect x="0"  y="28" width="120" height="1" fill="#fff" opacity="0.12"/>
        <rect x="0" y="0"  width="120" height="24" fill="url(#tabShade)"/>
        <rect x="0" y="28" width="120" height="24" fill="url(#tabShade)"/>
        <rect width="120" height="56" filter="url(#grain)" opacity="0.10"/>
      </svg>`;
      return svgUri(svg);
    }

    case 'designer': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="64">
        <defs>
          <filter id="dgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="6" stitchTiles="stitch" result="n"/>
            <feColorMatrix type="saturate" values="0" in="n" result="grey"/>
            <feBlend in="SourceGraphic" in2="grey" mode="multiply"/>
          </filter>
          <linearGradient id="dShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0.1"/>
            <stop offset="0.25" stop-color="#fff" stop-opacity="0"/>
            <stop offset="0.7" stop-color="#000" stop-opacity="0.05"/>
            <stop offset="1" stop-color="#000" stop-opacity="0.18"/>
          </linearGradient>
        </defs>
        <rect width="120" height="64" fill="#a0a0a0"/>
        <rect x="0"  y="0" width="28" height="27" fill="#a8a8a8"/>
        <rect x="30" y="0" width="42" height="27" fill="#9a9a9a"/>
        <rect x="74" y="0" width="46" height="27" fill="#a4a4a4"/>
        <rect x="-8"  y="33" width="36" height="27" fill="#9e9e9e"/>
        <rect x="30"  y="33" width="38" height="27" fill="#a6a6a6"/>
        <rect x="70"  y="33" width="30" height="27" fill="#989898"/>
        <rect x="102" y="33" width="26" height="27" fill="#a2a2a2"/>
        <rect x="0" y="25" width="120" height="8" fill="#000" opacity="0.40"/>
        <rect x="0" y="25" width="120" height="2" fill="#000" opacity="0.30"/>
        <rect x="0" y="58" width="120" height="6" fill="#000" opacity="0.40"/>
        <rect x="0" y="58" width="120" height="2" fill="#000" opacity="0.30"/>
        <rect x="0" y="25" width="120" height="1" fill="#fff" opacity="0.20"/>
        <rect x="0" y="58" width="120" height="1" fill="#fff" opacity="0.20"/>
        <rect x="0" y="0"  width="120" height="0.8" fill="#fff" opacity="0.10"/>
        <rect x="0" y="33" width="120" height="0.8" fill="#fff" opacity="0.10"/>
        <rect x="28"  y="0" width="2" height="27" fill="#555" opacity="0.40"/>
        <rect x="72"  y="0" width="2" height="27" fill="#555" opacity="0.40"/>
        <rect x="28"  y="33" width="2" height="27" fill="#555" opacity="0.40"/>
        <rect x="68"  y="33" width="2" height="27" fill="#555" opacity="0.40"/>
        <rect x="100" y="33" width="2" height="27" fill="#555" opacity="0.40"/>
        <rect x="0" y="0"  width="120" height="27" fill="url(#dShade)"/>
        <rect x="0" y="33" width="120" height="27" fill="url(#dShade)"/>
        <rect width="120" height="64" filter="url(#dgrain)" opacity="0.12"/>
      </svg>`;
      return svgUri(svg);
    }

    case 'metal': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="80">
        <defs>
          <linearGradient id="panelSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0"    stop-color="#fff" stop-opacity="0.10"/>
            <stop offset="0.35" stop-color="#fff" stop-opacity="0.02"/>
            <stop offset="0.65" stop-color="#000" stop-opacity="0.02"/>
            <stop offset="1"    stop-color="#000" stop-opacity="0.08"/>
          </linearGradient>
          <linearGradient id="seamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0"    stop-color="#000" stop-opacity="0.3"/>
            <stop offset="0.3"  stop-color="#000" stop-opacity="0.5"/>
            <stop offset="0.5"  stop-color="#555" stop-opacity="0.4"/>
            <stop offset="0.7"  stop-color="#fff" stop-opacity="0.25"/>
            <stop offset="1"    stop-color="#fff" stop-opacity="0.05"/>
          </linearGradient>
          <filter id="brush">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.6" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
        </defs>
        <rect width="72" height="80" fill="#c4c8cc"/>
        <rect x="0"  y="0" width="32" height="80" fill="#cdd0d4"/>
        <rect x="40" y="0" width="32" height="80" fill="#cdd0d4"/>
        <rect x="31" y="0" width="10" height="80" fill="url(#seamGrad)"/>
        <rect x="0"  y="0" width="32" height="80" fill="url(#panelSheen)"/>
        <rect x="40" y="0" width="32" height="80" fill="url(#panelSheen)"/>
        <line x1="0" y1="8"  x2="72" y2="8"  stroke="#999" stroke-width="0.3" opacity="0.15"/>
        <line x1="0" y1="18" x2="72" y2="18" stroke="#999" stroke-width="0.3" opacity="0.12"/>
        <line x1="0" y1="30" x2="72" y2="30" stroke="#999" stroke-width="0.3" opacity="0.15"/>
        <line x1="0" y1="42" x2="72" y2="42" stroke="#999" stroke-width="0.3" opacity="0.12"/>
        <line x1="0" y1="55" x2="72" y2="55" stroke="#999" stroke-width="0.3" opacity="0.15"/>
        <line x1="0" y1="68" x2="72" y2="68" stroke="#999" stroke-width="0.3" opacity="0.12"/>
        <rect width="72" height="80" filter="url(#brush)" opacity="0.04"/>
      </svg>`;
      return svgUri(svg);
    }

    // ════════════════════════════════════════════════════════════════════════
    //  SIDING TEXTURES
    // ════════════════════════════════════════════════════════════════════════

    case 'horizontal-lap':
    case 'dutch-lap': {
      // Vinyl lap siding — horizontal courses with woodgrain and shadow lines
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="56">
        <defs>
          <filter id="wg">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.8" numOctaves="4" stitchTiles="stitch" result="n"/>
            <feColorMatrix type="saturate" values="0" in="n" result="grey"/>
            <feBlend in="SourceGraphic" in2="grey" mode="multiply"/>
          </filter>
          <linearGradient id="lapShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0.12"/>
            <stop offset="0.15" stop-color="#fff" stop-opacity="0.04"/>
            <stop offset="0.7" stop-color="#000" stop-opacity="0"/>
            <stop offset="1" stop-color="#000" stop-opacity="0.10"/>
          </linearGradient>
        </defs>
        <rect width="120" height="56" fill="#c8c8c6"/>
        <rect x="0" y="0"  width="120" height="24" fill="#d0d0ce"/>
        <rect x="0" y="28" width="120" height="24" fill="#cdcdcb"/>
        <rect x="0" y="23" width="120" height="5" fill="#000" opacity="0.30"/>
        <rect x="0" y="23" width="120" height="1.5" fill="#000" opacity="0.20"/>
        <rect x="0" y="51" width="120" height="5" fill="#000" opacity="0.30"/>
        <rect x="0" y="51" width="120" height="1.5" fill="#000" opacity="0.20"/>
        <rect x="0" y="0"  width="120" height="1.2" fill="#fff" opacity="0.20"/>
        <rect x="0" y="28" width="120" height="1.2" fill="#fff" opacity="0.20"/>
        <rect x="0" y="0"  width="120" height="24" fill="url(#lapShade)"/>
        <rect x="0" y="28" width="120" height="24" fill="url(#lapShade)"/>
        <line x1="0" y1="5"  x2="120" y2="6"  stroke="#aaa" stroke-width="0.6" opacity="0.25"/>
        <line x1="0" y1="9"  x2="120" y2="8"  stroke="#aaa" stroke-width="0.4" opacity="0.20"/>
        <line x1="0" y1="14" x2="120" y2="15" stroke="#aaa" stroke-width="0.5" opacity="0.22"/>
        <line x1="0" y1="18" x2="120" y2="17" stroke="#aaa" stroke-width="0.4" opacity="0.18"/>
        <line x1="0" y1="33" x2="120" y2="34" stroke="#aaa" stroke-width="0.6" opacity="0.25"/>
        <line x1="0" y1="37" x2="120" y2="36" stroke="#aaa" stroke-width="0.4" opacity="0.20"/>
        <line x1="0" y1="42" x2="120" y2="43" stroke="#aaa" stroke-width="0.5" opacity="0.22"/>
        <line x1="0" y1="46" x2="120" y2="45" stroke="#aaa" stroke-width="0.4" opacity="0.18"/>
        <rect width="120" height="56" filter="url(#wg)" opacity="0.06"/>
      </svg>`;
      return svgUri(svg);
    }

    case 'vertical-panel':
    case 'board-batten': {
      // Vertical plank siding — wide planks with narrow raised battens
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="80">
        <defs>
          <filter id="vg">
            <feTurbulence type="fractalNoise" baseFrequency="0.8 0.02" numOctaves="4" stitchTiles="stitch" result="n"/>
            <feColorMatrix type="saturate" values="0" in="n" result="grey"/>
            <feBlend in="SourceGraphic" in2="grey" mode="multiply"/>
          </filter>
          <linearGradient id="batShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#fff" stop-opacity="0.10"/>
            <stop offset="0.15" stop-color="#fff" stop-opacity="0.02"/>
            <stop offset="0.85" stop-color="#000" stop-opacity="0.02"/>
            <stop offset="1" stop-color="#000" stop-opacity="0.10"/>
          </linearGradient>
          <linearGradient id="batRidge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0"   stop-color="#000" stop-opacity="0.22"/>
            <stop offset="0.15" stop-color="#000" stop-opacity="0.08"/>
            <stop offset="0.3" stop-color="#fff" stop-opacity="0.10"/>
            <stop offset="0.5" stop-color="#fff" stop-opacity="0.12"/>
            <stop offset="0.7" stop-color="#fff" stop-opacity="0.10"/>
            <stop offset="0.85" stop-color="#000" stop-opacity="0.08"/>
            <stop offset="1"   stop-color="#000" stop-opacity="0.22"/>
          </linearGradient>
        </defs>
        <rect width="72" height="80" fill="#c8c8c6"/>
        <rect x="0"  y="0" width="28" height="80" fill="#d0d0ce"/>
        <rect x="40" y="0" width="28" height="80" fill="#cdcdcb"/>
        <rect x="0"  y="0" width="28" height="80" fill="url(#batShade)"/>
        <rect x="40" y="0" width="28" height="80" fill="url(#batShade)"/>
        <rect x="27" y="0" width="14" height="80" fill="#c6c6c4"/>
        <rect x="27" y="0" width="14" height="80" fill="url(#batRidge)"/>
        <rect x="27" y="0" width="1.5" height="80" fill="#000" opacity="0.18"/>
        <rect x="39.5" y="0" width="1.5" height="80" fill="#000" opacity="0.18"/>
        <line x1="7"  y1="0" x2="6"  y2="80" stroke="#aaa" stroke-width="0.5" opacity="0.22"/>
        <line x1="14" y1="0" x2="15" y2="80" stroke="#aaa" stroke-width="0.4" opacity="0.18"/>
        <line x1="20" y1="0" x2="19" y2="80" stroke="#aaa" stroke-width="0.4" opacity="0.16"/>
        <line x1="48" y1="0" x2="49" y2="80" stroke="#aaa" stroke-width="0.5" opacity="0.22"/>
        <line x1="55" y1="0" x2="54" y2="80" stroke="#aaa" stroke-width="0.4" opacity="0.18"/>
        <line x1="62" y1="0" x2="63" y2="80" stroke="#aaa" stroke-width="0.4" opacity="0.16"/>
        <line x1="33" y1="0" x2="34" y2="80" stroke="#aaa" stroke-width="0.3" opacity="0.15"/>
        <rect width="72" height="80" filter="url(#vg)" opacity="0.06"/>
      </svg>`;
      return svgUri(svg);
    }

    case 'rustic-shingle':
    case 'shake':
    case 'cedar-shake': {
      // Staggered hand-split shingles — irregular widths, rough grain
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64">
        <defs>
          <filter id="sg">
            <feTurbulence type="fractalNoise" baseFrequency="0.6 0.15" numOctaves="5" stitchTiles="stitch" result="n"/>
            <feColorMatrix type="saturate" values="0" in="n" result="grey"/>
            <feBlend in="SourceGraphic" in2="grey" mode="multiply"/>
          </filter>
          <linearGradient id="shingleShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0.06"/>
            <stop offset="0.5" stop-color="#fff" stop-opacity="0"/>
            <stop offset="1" stop-color="#000" stop-opacity="0.10"/>
          </linearGradient>
        </defs>
        <rect width="96" height="64" fill="#b5b1ab"/>
        <rect x="0"  y="0" width="16" height="27" fill="#bcb8b2" rx="0.8"/>
        <rect x="18" y="0" width="22" height="27" fill="#b8b4ae" rx="0.8"/>
        <rect x="42" y="0" width="14" height="27" fill="#c0bcb6" rx="0.8"/>
        <rect x="58" y="0" width="20" height="27" fill="#b6b2ac" rx="0.8"/>
        <rect x="80" y="0" width="16" height="27" fill="#bbb7b1" rx="0.8"/>
        <rect x="-6" y="31" width="20" height="27" fill="#b8b4ae" rx="0.8"/>
        <rect x="16" y="31" width="18" height="27" fill="#bebab4" rx="0.8"/>
        <rect x="36" y="31" width="24" height="27" fill="#b4b0aa" rx="0.8"/>
        <rect x="62" y="31" width="16" height="27" fill="#bcb8b2" rx="0.8"/>
        <rect x="80" y="31" width="22" height="27" fill="#b6b2ac" rx="0.8"/>
        <rect x="0" y="26" width="96" height="5" fill="#000" opacity="0.35"/>
        <rect x="0" y="26" width="96" height="1.5" fill="#000" opacity="0.22"/>
        <rect x="0" y="57" width="96" height="5" fill="#000" opacity="0.35"/>
        <rect x="0" y="57" width="96" height="1.5" fill="#000" opacity="0.22"/>
        <rect x="16"  y="0" width="2" height="27" fill="#555" opacity="0.25"/>
        <rect x="40"  y="0" width="2" height="27" fill="#555" opacity="0.25"/>
        <rect x="56"  y="0" width="2" height="27" fill="#555" opacity="0.25"/>
        <rect x="78"  y="0" width="2" height="27" fill="#555" opacity="0.25"/>
        <rect x="14"  y="31" width="2" height="27" fill="#555" opacity="0.25"/>
        <rect x="34"  y="31" width="2" height="27" fill="#555" opacity="0.25"/>
        <rect x="60"  y="31" width="2" height="27" fill="#555" opacity="0.25"/>
        <rect x="78"  y="31" width="2" height="27" fill="#555" opacity="0.25"/>
        <rect x="0" y="0"  width="96" height="27" fill="url(#shingleShade)"/>
        <rect x="0" y="31" width="96" height="27" fill="url(#shingleShade)"/>
        <line x1="8"  y1="0" x2="7"  y2="27" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="30" y1="0" x2="31" y2="27" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="50" y1="0" x2="49" y2="27" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="68" y1="0" x2="69" y2="27" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="88" y1="0" x2="87" y2="27" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="6"  y1="31" x2="5"  y2="58" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="26" y1="31" x2="27" y2="58" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="48" y1="31" x2="47" y2="58" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="72" y1="31" x2="73" y2="58" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <line x1="90" y1="31" x2="89" y2="58" stroke="#888" stroke-width="0.5" opacity="0.22"/>
        <rect width="96" height="64" filter="url(#sg)" opacity="0.09"/>
      </svg>`;
      return svgUri(svg);
    }

    default:
      return undefined;
  }
}
