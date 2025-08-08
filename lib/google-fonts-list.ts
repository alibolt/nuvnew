// Popular Google Fonts for E-commerce (Curated List)
// Full list: https://fonts.google.com/

export interface GoogleFont {
  value: string;
  label: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  weights?: number[];
  popular?: boolean;
}

export const googleFonts: GoogleFont[] = [
  // Sans-serif fonts
  { value: 'Inter', label: 'Inter', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popular: true },
  { value: 'Roboto', label: 'Roboto', category: 'sans-serif', weights: [100, 300, 400, 500, 700, 900], popular: true },
  { value: 'Open Sans', label: 'Open Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { value: 'Montserrat', label: 'Montserrat', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popular: true },
  { value: 'Poppins', label: 'Poppins', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popular: true },
  { value: 'Lato', label: 'Lato', category: 'sans-serif', weights: [100, 300, 400, 700, 900] },
  { value: 'Raleway', label: 'Raleway', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'sans-serif', weights: [200, 300, 400, 600, 700, 900] },
  { value: 'Nunito', label: 'Nunito', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { value: 'Work Sans', label: 'Work Sans', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: 'DM Sans', label: 'DM Sans', category: 'sans-serif', weights: [400, 500, 700], popular: true },
  { value: 'Manrope', label: 'Manrope', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800] },
  { value: 'Outfit', label: 'Outfit', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  
  // Serif fonts
  { value: 'Playfair Display', label: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900], popular: true },
  { value: 'Merriweather', label: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900] },
  { value: 'Lora', label: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { value: 'Crimson Text', label: 'Crimson Text', category: 'serif', weights: [400, 600, 700] },
  { value: 'Cormorant', label: 'Cormorant', category: 'serif', weights: [300, 400, 500, 600, 700] },
  { value: 'EB Garamond', label: 'EB Garamond', category: 'serif', weights: [400, 500, 600, 700, 800] },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', category: 'serif', weights: [400, 700] },
  { value: 'Noto Serif', label: 'Noto Serif', category: 'serif', weights: [400, 700] },
  
  // Display fonts
  { value: 'Bebas Neue', label: 'Bebas Neue', category: 'display', weights: [400], popular: true },
  { value: 'Oswald', label: 'Oswald', category: 'display', weights: [200, 300, 400, 500, 600, 700] },
  { value: 'Anton', label: 'Anton', category: 'display', weights: [400] },
  { value: 'Righteous', label: 'Righteous', category: 'display', weights: [400] },
  { value: 'Archivo Black', label: 'Archivo Black', category: 'display', weights: [400] },
  { value: 'Bungee', label: 'Bungee', category: 'display', weights: [400] },
  
  // Handwriting/Script fonts
  { value: 'Dancing Script', label: 'Dancing Script', category: 'handwriting', weights: [400, 500, 600, 700] },
  { value: 'Pacifico', label: 'Pacifico', category: 'handwriting', weights: [400] },
  { value: 'Caveat', label: 'Caveat', category: 'handwriting', weights: [400, 500, 600, 700] },
  { value: 'Satisfy', label: 'Satisfy', category: 'handwriting', weights: [400] },
  
  // Monospace fonts
  { value: 'Fira Code', label: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700] },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800] },
  { value: 'Source Code Pro', label: 'Source Code Pro', category: 'monospace', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700] }
];

// Get fonts by category
export function getFontsByCategory(category: GoogleFont['category']) {
  return googleFonts.filter(font => font.category === category);
}

// Get popular fonts
export function getPopularFonts() {
  return googleFonts.filter(font => font.popular);
}

// Get font weights
export function getFontWeights(fontName: string): number[] {
  const font = googleFonts.find(f => f.value === fontName);
  return font?.weights || [400, 700];
}

// Build Google Fonts URL
export function buildGoogleFontsUrl(fonts: { name: string; weights?: number[] }[]): string {
  const families = fonts.map(font => {
    const weights = font.weights || getFontWeights(font.name);
    return `${font.name.replace(/ /g, '+')}:wght@${weights.join(';')}`;
  });
  
  return `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join('&')}&display=swap`;
}

// Font pairing suggestions
export const fontPairings = [
  {
    heading: 'Playfair Display',
    body: 'Open Sans',
    description: 'Elegant and modern - perfect for fashion and luxury'
  },
  {
    heading: 'Montserrat',
    body: 'Lato',
    description: 'Clean and professional - great for tech and business'
  },
  {
    heading: 'Bebas Neue',
    body: 'Roboto',
    description: 'Bold and contemporary - ideal for sports and lifestyle'
  },
  {
    heading: 'Poppins',
    body: 'Inter',
    description: 'Friendly and readable - excellent for all purposes'
  },
  {
    heading: 'Cormorant',
    body: 'Work Sans',
    description: 'Sophisticated contrast - perfect for editorial'
  }
];