/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          primary: "#7C3AED",    // Deep Purple
          secondary: "#9D4EDD",  // Light Purple
          gold: "#F59E0B",       // Gold accent
          dark: "#0A0A0F",       // Deep black
          card: "#12121A",       // Card background
          surface: "#1A1A2E",    // Surface
          border: "#2D2D44",     // Borders
          muted: "#6B7280",      // Muted text
        },
        // Text
        text: {
          primary: "#FFFFFF",
          secondary: "#B3B3CC",
          muted: "#6B7280",
          accent: "#F59E0B",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "system-ui", "sans-serif"],
        mono: ["JetBrainsMono", "monospace"],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0A0A0F 0%, #1A0A2E 50%, #0A0A0F 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-player': 'linear-gradient(180deg, rgba(10,10,15,0) 0%, #0A0A0F 70%)',
      },
    },
  },
  plugins: [],
};
