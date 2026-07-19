/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        bgp: "var(--bg-primary)",
        bgs: "var(--bg-secondary)",
        brand: "var(--brand)",
        brand2: "var(--brand-2)",
        bordc: "var(--border-c)",
        txt: "var(--text-primary)",
        txt2: "var(--text-secondary)",
      },
      borderRadius: {
        theme: "var(--radius-base)",
      },
      boxShadow: {
        theme: "var(--shadow-1)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
