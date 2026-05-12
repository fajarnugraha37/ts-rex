import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true, // Akan menghasilkan dist/index.d.ts yang sudah ter-merge
  minify: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: "es2020",
  platform: "neutral", // Agar aman digunakan di Browser, Node, Bun, dan Deno
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".mjs",
    };
  }
});