import { readFile } from "fs/promises";
import path from "path";
import { defineConfig } from "rolldown";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(await readFile(path.resolve(__dirname, "package.json"), "utf-8"));

export default defineConfig([
	{
		input: packageJson.source,
		output: {
			dir: "dist",
		},
		external: [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.peerDependencies)],
	},
]);
