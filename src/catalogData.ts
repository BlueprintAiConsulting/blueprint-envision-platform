/**
 * BlueprintEnvision — Generic Siding Catalog
 * All product names and color values are original to BlueprintEnvision.
 * Hex values are independently derived approximations of common exterior color families.
 */

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

// Good Tier — Horizon™ Vinyl Siding
export const HORIZON_OPTIONS: SidingLine[] = [
  {
    tier: 'Good',
    line: 'Horizon™',
    material: 'Vinyl Siding',
    profileLabel: 'D5″ Lap / D5″ Dutch / Beaded',
    textureImage: '/textures/horizontal-lap.png',
    textureStyle: 'horizontal-lap',
    description: 'Reliable performance and classic curb appeal for any home.',
    colors: [
      { id: 'hz-russet',         name: 'Russet',          hex: '#782E2D', hue: 'Deep brick red'          },
      { id: 'hz-harvest-gold',   name: 'Harvest Gold',    hex: '#D4B767', hue: 'Warm harvest yellow'     },
      { id: 'hz-quarry-stone',   name: 'Quarry Stone',    hex: '#9E958D', hue: 'Warm light gray-beige'   },
      { id: 'hz-graphite',       name: 'Graphite',        hex: '#4C4A4E', hue: 'Near-black dark gray'     },
      { id: 'hz-linen-white',    name: 'Linen White',     hex: '#E6E4DD', hue: 'Warm off-white'           },
      { id: 'hz-sage',           name: 'Sage',            hex: '#989C7D', hue: 'Warm olive-gray'          },
      { id: 'hz-sandbar',        name: 'Sandbar',         hex: '#D6C9B2', hue: 'Sandy warm tan'           },
      { id: 'hz-fieldstone',     name: 'Fieldstone',      hex: '#736C64', hue: 'Warm slate gray'          },
      { id: 'hz-deep-forest',    name: 'Deep Forest',     hex: '#486540', hue: 'Rich deep green'          },
      { id: 'hz-pewter',         name: 'Pewter',          hex: '#8A8985', hue: 'Neutral medium gray'      },
      { id: 'hz-ashwood',        name: 'Ashwood',         hex: '#86827E', hue: 'Warm medium gray'         },
      { id: 'hz-buttercup',      name: 'Buttercup',       hex: '#EBDEBB', hue: 'Buttery cream'            },
      { id: 'hz-warm-wheat',     name: 'Warm Wheat',      hex: '#C7B789', hue: 'Warm wheat sand'          },
      { id: 'hz-earth-clay',     name: 'Earth Clay',      hex: '#C6B698', hue: 'Warm earthy clay'         },
      { id: 'hz-slate-blue',     name: 'Slate Blue',      hex: '#8D9EA6', hue: 'Dusty steel blue'         },
      { id: 'hz-harbor-blue',    name: 'Harbor Blue',     hex: '#687B87', hue: 'Muted slate blue'         },
      { id: 'hz-dark-walnut',    name: 'Dark Walnut',     hex: '#583C2C', hue: 'Dark warm brown'          },
      { id: 'hz-desert-sand',    name: 'Desert Sand',     hex: '#D2C4A5', hue: 'Warm sandy beige'         },
      { id: 'hz-golden-straw',   name: 'Golden Straw',    hex: '#C2AC7F', hue: 'Warm golden wicker'       },
      { id: 'hz-marsh-green',    name: 'Marsh Green',     hex: '#889675', hue: 'Sage green-gray'          },
      { id: 'hz-arctic-white',   name: 'Arctic White',    hex: '#F0F0EE', hue: 'Crisp near-white'         },
      { id: 'hz-evergreen',      name: 'Evergreen',       hex: '#505E56', hue: 'Dark spruce green'        },
      { id: 'hz-silver-mist',    name: 'Silver Mist',     hex: '#B6B4AE', hue: 'Light silver-gray'        },
      { id: 'hz-driftwood',      name: 'Driftwood',       hex: '#9C8C76', hue: 'Aged driftwood gray'      },
      { id: 'hz-ocean-blue',     name: 'Ocean Blue',      hex: '#6C8998', hue: 'Medium coastal blue'      },
    ]
  }
];

// Better Tier — Prestige™ Premium Vinyl
export const PRESTIGE_OPTIONS: SidingLine[] = [
  {
    tier: 'Better',
    line: 'Prestige™',
    material: 'Premium Vinyl Siding',
    profileLabel: 'D5″ Lap / D5″ Dutch / S7″',
    textureImage: '/textures/dutch-lap.png',
    textureStyle: 'dutch-lap',
    description: 'Enhanced woodgrain texture with a rich 38-color curated palette.',
    colors: [
      { id: 'pr-meadow-blend',   name: 'Meadow Blend',    hex: '#9DA57F', hue: 'Green-gray natural mix'   },
      { id: 'pr-russet',         name: 'Russet',          hex: '#782E2D', hue: 'Deep brick red'           },
      { id: 'pr-warm-umber',     name: 'Warm Umber',      hex: '#6C5844', hue: 'Medium warm brown'        },
      { id: 'pr-quarry-stone',   name: 'Quarry Stone',    hex: '#9E958D', hue: 'Warm light gray-beige'    },
      { id: 'pr-cedar-tone',     name: 'Cedar Tone',      hex: '#885A37', hue: 'Reddish-brown cedar'      },
      { id: 'pr-graphite',       name: 'Graphite',        hex: '#4C4A4E', hue: 'Near-black dark gray'     },
      { id: 'pr-linen-white',    name: 'Linen White',     hex: '#E6E4DD', hue: 'Warm off-white'           },
      { id: 'pr-sage',           name: 'Sage',            hex: '#989C7D', hue: 'Warm olive-gray'          },
      { id: 'pr-teal-steel',     name: 'Teal Steel',      hex: '#425868', hue: 'Deep teal-steel blue'     },
      { id: 'pr-sandbar',        name: 'Sandbar',         hex: '#D6C9B2', hue: 'Sandy warm tan'           },
      { id: 'pr-silver-cedar',   name: 'Silver Cedar',    hex: '#A0A09A', hue: 'Aged cedar silvery gray'  },
      { id: 'pr-dark-roast',     name: 'Dark Roast',      hex: '#382016', hue: 'Very dark espresso'       },
      { id: 'pr-fieldstone',     name: 'Fieldstone',      hex: '#736C64', hue: 'Warm slate gray'          },
      { id: 'pr-deep-forest',    name: 'Deep Forest',     hex: '#486540', hue: 'Rich deep green'          },
      { id: 'pr-canyon-blend',   name: 'Canyon Blend',    hex: '#AE967E', hue: 'Warm mixed sandy-brown'   },
      { id: 'pr-pewter',         name: 'Pewter',          hex: '#8A8985', hue: 'Neutral medium gray'      },
      { id: 'pr-ashwood',        name: 'Ashwood',         hex: '#86827E', hue: 'Warm medium gray'         },
      { id: 'pr-buttercup',      name: 'Buttercup',       hex: '#EBDEBB', hue: 'Buttery cream'            },
      { id: 'pr-warm-wheat',     name: 'Warm Wheat',      hex: '#C7B789', hue: 'Warm wheat sand'          },
      { id: 'pr-periwinkle',     name: 'Periwinkle Mist', hex: '#8D93A2', hue: 'Dusty periwinkle gray'    },
      { id: 'pr-deep-navy',      name: 'Deep Navy',       hex: '#2A3B50', hue: 'Deep navy blue'           },
      { id: 'pr-natural-blend',  name: 'Natural Blend',   hex: '#CBB697', hue: 'Fresh cedar light tan'    },
      { id: 'pr-earth-clay',     name: 'Earth Clay',      hex: '#C6B698', hue: 'Warm earthy clay'         },
      { id: 'pr-olive-grove',    name: 'Olive Grove',     hex: '#696E4F', hue: 'Warm olive green'         },
      { id: 'pr-slate-blue',     name: 'Slate Blue',      hex: '#8D9EA6', hue: 'Dusty steel blue'         },
      { id: 'pr-harbor-blue',    name: 'Harbor Blue',     hex: '#687B87', hue: 'Muted slate blue'         },
      { id: 'pr-rustic-blend',   name: 'Rustic Blend',    hex: '#887068', hue: 'Seasoned cedar brown-gray'},
      { id: 'pr-dark-walnut',    name: 'Dark Walnut',     hex: '#583C2C', hue: 'Dark warm brown'          },
      { id: 'pr-desert-sand',    name: 'Desert Sand',     hex: '#D2C4A5', hue: 'Warm sandy beige'         },
      { id: 'pr-golden-straw',   name: 'Golden Straw',    hex: '#C2AC7F', hue: 'Warm golden wicker'       },
      { id: 'pr-marsh-green',    name: 'Marsh Green',     hex: '#889675', hue: 'Sage green-gray'          },
      { id: 'pr-iron',           name: 'Iron',            hex: '#676F75', hue: 'Cool blue-gray'           },
      { id: 'pr-smoke',          name: 'Smoke',           hex: '#696B6D', hue: 'Medium cool gray'         },
      { id: 'pr-steel-blue',     name: 'Steel Blue',      hex: '#888C96', hue: 'Cool gray-blue'           },
      { id: 'pr-evergreen',      name: 'Evergreen',       hex: '#505E56', hue: 'Dark spruce green'        },
      { id: 'pr-silver-mist',    name: 'Silver Mist',     hex: '#B6B4AE', hue: 'Light silver-gray'        },
      { id: 'pr-weathered-blend',name: 'Weathered Blend', hex: '#88766E', hue: 'Gray-brown weathered'     },
      { id: 'pr-driftwood',      name: 'Driftwood',       hex: '#9C8C76', hue: 'Aged driftwood gray'      },
    ]
  }
];

// Best Tier — Artisan Cedar™ Shakes & Shingles
export const ARTISAN_OPTIONS: SidingLine[] = [
  {
    tier: 'Best',
    line: 'Artisan Cedar™',
    material: 'Polymer Shakes & Shingles',
    profileLabel: 'T5″ Straight / D7″ Staggered',
    textureImage: '/textures/cedar-shake.png',
    textureStyle: 'shake',
    description: 'Authentic cedar shingle character with a hand-selected color palette.',
    colors: [
      { id: 'ac-russet',         name: 'Russet',           hex: '#782E2D', hue: 'Deep brick red'           },
      { id: 'ac-bermuda',        name: 'Bermuda',          hex: '#7899AD', hue: 'Soft caribbean blue'       },
      { id: 'ac-warm-umber',     name: 'Warm Umber',       hex: '#6C5844', hue: 'Medium warm brown'         },
      { id: 'ac-quarry-stone',   name: 'Quarry Stone',     hex: '#9E958D', hue: 'Warm light gray-beige'     },
      { id: 'ac-cedar-tone',     name: 'Cedar Tone',       hex: '#885A37', hue: 'Reddish-brown fresh cedar' },
      { id: 'ac-graphite',       name: 'Graphite',         hex: '#4C4A4E', hue: 'Near-black dark gray'      },
      { id: 'ac-linen-white',    name: 'Linen White',      hex: '#E6E4DD', hue: 'Warm off-white'            },
      { id: 'ac-sage',           name: 'Sage',             hex: '#989C7D', hue: 'Warm olive-gray'           },
      { id: 'ac-teal-steel',     name: 'Teal Steel',       hex: '#425868', hue: 'Deep teal-steel blue'      },
      { id: 'ac-silver-cedar',   name: 'Silver Cedar',     hex: '#A0A09A', hue: 'Aged cedar silvery gray'   },
      { id: 'ac-dark-roast',     name: 'Dark Roast',       hex: '#382016', hue: 'Very dark espresso'        },
      { id: 'ac-fieldstone',     name: 'Fieldstone',       hex: '#736C64', hue: 'Warm slate gray'           },
      { id: 'ac-pewter',         name: 'Pewter',           hex: '#8A8985', hue: 'Neutral medium gray'       },
      { id: 'ac-hearthstone',    name: 'Hearthstone',      hex: '#877666', hue: 'Warm gray-brown'           },
      { id: 'ac-periwinkle',     name: 'Periwinkle Mist',  hex: '#8D93A2', hue: 'Dusty periwinkle gray'     },
      { id: 'ac-deep-navy',      name: 'Deep Navy',        hex: '#2A3B50', hue: 'Deep navy blue'            },
      { id: 'ac-natural-blend',  name: 'Natural Blend',    hex: '#CBB697', hue: 'Fresh cedar light tan'     },
      { id: 'ac-earth-clay',     name: 'Earth Clay',       hex: '#C6B698', hue: 'Warm earthy clay'          },
      { id: 'ac-harbor-blue',    name: 'Harbor Blue',      hex: '#687B87', hue: 'Muted slate blue'          },
      { id: 'ac-rustic-blend',   name: 'Rustic Blend',     hex: '#887068', hue: 'Seasoned cedar brown-gray' },
      { id: 'ac-dark-walnut',    name: 'Dark Walnut',      hex: '#583C2C', hue: 'Dark warm brown'           },
      { id: 'ac-golden-straw',   name: 'Golden Straw',     hex: '#C2AC7F', hue: 'Warm golden wicker'        },
      { id: 'ac-marsh-green',    name: 'Marsh Green',      hex: '#889675', hue: 'Sage green-gray'           },
      { id: 'ac-iron',           name: 'Iron',             hex: '#676F75', hue: 'Cool blue-gray'            },
      { id: 'ac-silver-mist',    name: 'Silver Mist',      hex: '#B6B4AE', hue: 'Light silver-gray'         },
      { id: 'ac-onyx',           name: 'Onyx',             hex: '#2C2C2E', hue: 'Near-black charcoal'       },
      { id: 'ac-driftwood',      name: 'Driftwood',        hex: '#9C8C76', hue: 'Aged driftwood gray'       },
      { id: 'ac-ocean-blue',     name: 'Ocean Blue',       hex: '#6C8998', hue: 'Medium coastal blue'       },
    ]
  }
];

// Board & Batten Tier — Vertical Plank™
export const VERTICAL_OPTIONS: SidingLine[] = [
  {
    tier: 'B&B',
    line: 'Vertical Plank™',
    material: 'Insulated Board & Batten Vinyl',
    profileLabel: '7″ & 8″ Board + Batten — TrueCedar™ Texture',
    textureImage: '/textures/board-batten.png',
    textureStyle: 'board-batten',
    description: 'Vertical board & batten with authentic cedar texture and insulated foam backing.',
    style: 'vertical',
    colors: [
      { id: 'vp-russet',         name: 'Russet',          hex: '#782E2D', hue: 'Deep brick red'       },
      { id: 'vp-linen-white',    name: 'Linen White',     hex: '#E6E4DD', hue: 'Warm off-white'       },
      { id: 'vp-pewter',         name: 'Pewter',          hex: '#8A8985', hue: 'Neutral medium gray'  },
      { id: 'vp-warm-wheat',     name: 'Warm Wheat',      hex: '#C7B789', hue: 'Warm wheat sand'      },
      { id: 'vp-earth-clay',     name: 'Earth Clay',      hex: '#C6B698', hue: 'Warm earthy clay'     },
      { id: 'vp-golden-straw',   name: 'Golden Straw',    hex: '#C2AC7F', hue: 'Warm golden wicker'   },
      { id: 'vp-arctic-white',   name: 'Arctic White',    hex: '#F0F0EE', hue: 'Crisp near-white'     },
      { id: 'vp-silver-mist',    name: 'Silver Mist',     hex: '#B6B4AE', hue: 'Light silver-gray'    },
    ]
  }
];

export const SIDING_OPTIONS: SidingLine[] = [
  ...HORIZON_OPTIONS,
  ...PRESTIGE_OPTIONS,
  ...ARTISAN_OPTIONS,
];

export const ALL_SIDING_OPTIONS: SidingLine[] = [
  ...SIDING_OPTIONS,
  ...VERTICAL_OPTIONS,
];

export const DEFAULT_SIDING_LINE = PRESTIGE_OPTIONS[0];
export const DEFAULT_SIDING_COLOR = PRESTIGE_OPTIONS[0].colors[0];

// Standard paint colors for accent zones (shutters, trim)
// These are common exterior paint colors, not siding product colors
export const SHUTTER_COLORS: SidingColor[] = [
  { id: 'sh-jet-black',     name: 'Jet Black',      hex: '#1C1C1C', hue: 'Classic deep matte black'   },
  { id: 'sh-midnight-navy', name: 'Midnight Navy',  hex: '#1B2A4A', hue: 'Deep traditional navy blue' },
  { id: 'sh-forest-green',  name: 'Forest Green',   hex: '#2D4A2D', hue: 'Deep woodland green'        },
  { id: 'sh-colonial-red',  name: 'Colonial Red',   hex: '#7B2D2D', hue: 'Classic deep colonial red'  },
  { id: 'sh-burgundy',      name: 'Burgundy',       hex: '#5C1A2A', hue: 'Rich dark wine'             },
  { id: 'sh-pure-white',    name: 'Pure White',     hex: '#F5F5F0', hue: 'Crisp bright white'         },
  { id: 'sh-cream',         name: 'Cream',          hex: '#E8E0CC', hue: 'Warm off-white'             },
  { id: 'sh-slate-gray',    name: 'Slate Gray',     hex: '#6B7280', hue: 'Medium neutral gray'        },
  { id: 'sh-charcoal',      name: 'Charcoal',       hex: '#374151', hue: 'Dark warm gray'             },
  { id: 'sh-bronze',        name: 'Bronze',         hex: '#59422A', hue: 'Warm earthy bronze'         },
  { id: 'sh-hunter-green',  name: 'Hunter Green',   hex: '#1A3A2A', hue: 'Dark rich hunter green'     },
  { id: 'sh-espresso',      name: 'Espresso Brown', hex: '#3C2415', hue: 'Deep roasted dark brown'    },
];

export const TRIM_COLORS: SidingColor[] = [
  { id: 'tr-bright-white',  name: 'Bright White',  hex: '#F8F8F5', hue: 'Clean crisp white'    },
  { id: 'tr-antique-white', name: 'Antique White', hex: '#EDE8DC', hue: 'Warm classic white'   },
  { id: 'tr-cream',         name: 'Cream',         hex: '#E4DBCA', hue: 'Soft warm cream'      },
  { id: 'tr-linen',         name: 'Linen',         hex: '#D9CEBC', hue: 'Neutral beige-white'  },
  { id: 'tr-light-gray',    name: 'Light Gray',    hex: '#C8CBD0', hue: 'Subtle cool gray'     },
  { id: 'tr-silver-gray',   name: 'Silver Gray',   hex: '#A0A5AD', hue: 'Medium light gray'    },
  { id: 'tr-slate',         name: 'Slate',         hex: '#6B7685', hue: 'Blue-toned mid gray'  },
  { id: 'tr-charcoal',      name: 'Charcoal',      hex: '#3D4450', hue: 'Dark cool charcoal'   },
  { id: 'tr-black',         name: 'Matte Black',   hex: '#1C1E22', hue: 'Clean matte black'    },
  { id: 'tr-tan',           name: 'Tan',           hex: '#C4A97D', hue: 'Warm sandy tan'       },
  { id: 'tr-brown',         name: 'Warm Brown',    hex: '#7A5C3E', hue: 'Rich warm brown'      },
  { id: 'tr-navy',          name: 'Navy',          hex: '#1B2F4E', hue: 'Deep traditional navy'},
];
