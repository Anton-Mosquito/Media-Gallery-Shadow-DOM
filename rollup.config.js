import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import css from "rollup-plugin-import-css";

export default {
  input: "src/app.js",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [
    nodeResolve(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      extensions: [".js", ".mjs", ".cjs"],
    }),
    css({ output: "bundle.css" }),
  ],
};
