export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f7f9fc",
        "surface-container-low": "#f2f4f7",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e6e8eb",
        primary: "#00355f",
        "primary-container": "#0f4c81",
        secondary: "#006a69",
        "secondary-container": "#7df5f4",
        "on-surface": "#191c1e",
        "on-surface-variant": "#42474f",
        "outline-variant": "#c2c7d1",
        error: "#ba1a1a",
      },
      fontFamily: {
        headline: ["Be Vietnam Pro", "sans-serif"],
        body: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        ambient: "0 20px 40px rgba(17, 24, 39, 0.04)",
        diffusion: "0 24px 50px -20px rgba(17, 24, 39, 0.12)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #00355f 0%, #0f4c81 100%)",
      },
    },
  },
  plugins: [],
};
