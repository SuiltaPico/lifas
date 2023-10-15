import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
// import typescript from "@rollup/plugin-typescript";
// import ttypescript from "ttypescript";

// import UnoCSS from "unocss/vite";
// uno.config.ts
// import presetWind from "@unocss/preset-wind";
// import presetUno from "@unocss/preset-uno";
// import presetIcons from "@unocss/preset-icons";
// import transformerVariantGroup from "@unocss/transformer-variant-group";
// import { presetHeroPatterns } from "@julr/unocss-preset-heropatterns";

const theme = {
  colors: {
    primary: {
      900: "#020403",
      800: "#152E25",
      700: "#1B4A3A",
      600: "#1E6750",
      500: "#1E8667",
      400: "#27A680",
      300: "#71BFA2",
      200: "#A9D8C5",
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    // typescript({
    //   typescript: ttypescript,
    // }) as any,
    solidPlugin(),
    // ts2c({
    //   tsconfig: "./tsconfig.json",
    //   tsconfigOverride: {
    //     noEmit: true,
    //     "allowImportingTsExtensions": false,
    //   },
    // }) as any,
  ],

  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.app/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
}));
