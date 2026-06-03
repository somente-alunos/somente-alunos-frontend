import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./component/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./icon/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "new-primary": "#1d4ed8",
        "new-primary-700": "#153aa3",
        "new-secondary": "#166534",
        "new-secondary-100": "#dcfce7",
        "new-secondary-450": "#16a34a",
        "new-secondary-600": "#15803d",
        "new-secondary-700": "#0f4725",
        "new-tertiary-100": "#fee2e2",
        "new-tertiary-500": "#ef4444",
        "new-tertiary": "#b91c1c",
        "new-tertiary-700": "#8f1616",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
