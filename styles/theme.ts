export const theme = {
  colors: {
    // Primary brand colors - warm amber/orange for restaurant feel
    primary: {
      50: '#fef7ee',
      100: '#fdeddc',
      200: '#fad8b8',
      300: '#f6bc89',
      400: '#f19558',
      500: '#ed7734', // Main brand color
      600: '#de5d20',
      700: '#b8471c',
      800: '#94371a',
      900: '#77301c',
      950: '#40160a',
    },
    // Secondary colors - warm grays for sophistication
    secondary: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
      950: '#0c0a09',
    },
    // Accent colors - warm green for success states
    accent: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    // Status colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Semantic colors
    background: '#fafaf9',
    surface: '#ffffff',
    text: {
      primary: '#1c1917',
      secondary: '#57534e',
      muted: '#a8a29e',
      inverse: '#ffffff',
    },
    border: {
      light: '#e7e5e4',
      medium: '#d6d3d1',
      dark: '#a8a29e',
    }
  },
  
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '9999px',
  },
  
  shadows: {
    soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
    medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    large: '0 10px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Modern 2025 shadows with color
    glow: '0 0 20px rgba(237, 119, 52, 0.3), 0 0 40px rgba(237, 119, 52, 0.1)',
    glowSoft: '0 0 15px rgba(237, 119, 52, 0.2)',
    elevation1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    elevation2: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    elevation3: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    elevation4: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
    coloredShadow: '0 20px 40px -12px rgba(237, 119, 52, 0.25)',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
    smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  // Modern effects for 2025
  effects: {
    // Glass morphism
    glassDark: 'rgba(30, 41, 59, 0.7)',
    glassLight: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    blur: 'blur(20px)',
    blurHeavy: 'blur(40px)',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #ed7734 0%, #f19558 100%)',
    gradientAccent: 'linear-gradient(135deg, #f6bc89 0%, #ed7734 100%)',
    gradientBackground: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)',
    gradientDark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    gradientOrange: 'linear-gradient(to right, #ed7734, #f59e0b)',
    
    // Overlay effects
    overlayLight: 'rgba(255, 255, 255, 0.05)',
    overlayDark: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Animation keyframes and timing
  animations: {
    // Hover transforms
    hoverLift: 'translateY(-4px)',
    hoverScale: 'scale(1.02)',
    hoverScaleLarge: 'scale(1.05)',
    
    // Timing functions
    easeSmooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  }
};

export type Theme = typeof theme;