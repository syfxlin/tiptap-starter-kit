import { defineConfig } from "rollup";
import sourcemaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import sizes from "@atomico/rollup-plugin-sizes";
import autoExternal from "rollup-plugin-auto-external";
import css from "rollup-plugin-import-css";

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      name: "@syfxlin/tiptap-starter-kit",
      file: "dist/index.umd.js",
      format: "umd",
      sourcemap: true,
    },
    {
      name: "@syfxlin/tiptap-starter-kit",
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
      exports: "auto",
    },
    {
      name: "@syfxlin/tiptap-starter-kit",
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    css(),
    autoExternal({
      packagePath: "package.json",
    }),
    sourcemaps(),
    resolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
    }),
    sizes(),
    typescript({
      tsconfig: "../../tsconfig.json",
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          paths: {
            "@syfxlin/*": ["packages/*/src"],
          },
        },
        include: null,
      },
    }),
  ],
});
