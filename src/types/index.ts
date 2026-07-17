export interface SidingColor {
  id: string;
  name: string;
  hex: string;
  hue: string;
}

export interface SidingLine {
  tier: string;
  line: string;
  material: string;
  description: string;
  profileLabel: string;
  textureImage: string;
  textureStyle: 'horizontal-lap' | 'dutch-lap' | 'board-batten' | 'shake';
  colors: SidingColor[];
  style?: 'horizontal' | 'vertical';
}

export interface Section {
  id: string;
  name: string;
  maskData: string | null;
  selectedLine: SidingLine;
  selectedColor: SidingColor;
  maskTarget: string;
}

export interface QuickZone {
  id: string;
  name: string;
  enabled: boolean;
  selectedLine: SidingLine;
  selectedColor: SidingColor;
}

export interface RoofingColor {
  id: string;
  name: string;
  hex: string;
  hue: string;
  swatchImage?: string;
}

export interface RoofingLine {
  tier: string;
  line: string;
  materialType: string;
  profileLabel: string;
  textureImage: string;
  description: string;
  colors: RoofingColor[];
}

export interface QuickRoofZone {
  id: string;
  name: string;
  enabled: boolean;
  selectedLine: RoofingLine;
  selectedColor: RoofingColor;
}

export type TextureStyleKey = 'horizontal-lap' | 'dutch-lap' | 'board-batten' | 'shake';

export interface QuickZoneData {
  name: string;
  lineName: string;
  colorName: string;
  colorHex: string;
  hue: string;
  style?: 'horizontal' | 'vertical';
  textureStyle?: TextureStyleKey;
}

export interface SectionData {
  id: string;
  name: string;
  maskData: string | null;
  selectedLine: { tier: string; line: string; material: string };
  selectedColor: { name: string; hex: string; hue: string };
  maskTarget: string;
}
