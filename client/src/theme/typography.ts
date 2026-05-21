// Tipografia premium para Clínica da Alma
export const typography = {
  fonts: {
    primary: "'Playfair Display', serif", // Títulos elegantes
    secondary: "'Inter', sans-serif", // Corpo de texto
    accent: "'Cormorant Garamond', serif", // Acentos
  },

  sizes: {
    h1: { size: '3.5rem', weight: 700, lineHeight: 1.2 },
    h2: { size: '2.8rem', weight: 700, lineHeight: 1.3 },
    h3: { size: '2rem', weight: 600, lineHeight: 1.4 },
    h4: { size: '1.5rem', weight: 600, lineHeight: 1.5 },
    h5: { size: '1.25rem', weight: 600, lineHeight: 1.6 },
    h6: { size: '1rem', weight: 600, lineHeight: 1.7 },

    body: { size: '1rem', weight: 400, lineHeight: 1.6 },
    bodySmall: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
    bodyXSmall: { size: '0.75rem', weight: 400, lineHeight: 1.4 },

    button: { size: '1rem', weight: 600, lineHeight: 1.5 },
    buttonSmall: { size: '0.875rem', weight: 600, lineHeight: 1.4 },

    caption: { size: '0.75rem', weight: 500, lineHeight: 1.4 },
    overline: { size: '0.625rem', weight: 700, lineHeight: 1.3, letterSpacing: '0.1em' },
  },

  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const cssTypography = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');

h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
  letter-spacing: -0.02em;
}

body, p, span {
  font-family: 'Inter', sans-serif;
}

.accent-text {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
}
`;
