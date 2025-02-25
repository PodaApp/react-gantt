import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";

export default [
	{
		input: "./src/index.ts",
		logLevel: "debug",
		output: {
			format: "esm",
			sourcemap: false, // TOOD: The build output should include a sourcemap
			file: "./dist/index.esm.js",
		},
		external: ["react", "react/jsx-runtime", "react-dom", "zustand", "@dnd-kit/core"],
		plugins: [
			typescript({
				tsconfig: "../../tsconfig.json",
				declarationDir: "./dist/types",
			}),
			resolve(),
			commonjs(),
			postcss({
				extract: true, // Extract CSS into a separate file
			}),
			url(),
		],
	},
	{
		input: "./dist/types/index.d.ts",
		output: [{ file: "./dist/index.d.ts", format: "esm" }],
		external: [/\.css$/],
		plugins: [dts()],
	},
];
