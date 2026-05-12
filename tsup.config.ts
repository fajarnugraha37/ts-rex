import { glob } from "glob";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entryPoints: glob
      .sync("./src/**/*.{ts,js,esm,cjs,tsx,jsx,json,yaml,yml,html,css}")
      .filter((path) => !/(\.test\.ts|\.spec\.ts)$/.test(path))
      .map((path) => path.replaceAll("\\", "/")),
    tsconfig: "./tsconfig.json",
    outDir: "dist/",
    format: ["cjs", "esm"],
    dts: true,
    minify: true,
    clean: true,
    sourcemap: false,
    bundle: true,
    splitting: false,
    outExtension({ format }) {
      return {
        dts: ".d.ts",
        js: format === "cjs" ? ".cjs" : ".mjs",
      };
    },
    treeshake: false,
    target: "es2020",
    platform: "neutral",
    cjsInterop: true,
    keepNames: true,
    skipNodeModulesBundle: false,
  },
]);
