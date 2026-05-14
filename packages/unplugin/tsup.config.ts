import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],   // ← tambah iife
  dts: true,
  minify: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: "es2020",
  platform: "neutral",

  // Nama global yang akan dipasang di window (ganti sesuai nama library kamu)
  globalName: "TsRex",               // window.TsRex = ...

  // Ekstensi file output
  outExtension({ format }) {
    if (format === "cjs") return { js: ".cjs" };
    if (format === "esm") return { js: ".mjs" };
    if (format === "iife") return { js: ".umd.js" }; // atau .umd.js
    return { js: ".js" };
  },
});