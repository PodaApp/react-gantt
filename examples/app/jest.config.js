export default {
	testEnvironment: "jest-environment-jsdom",
	moduleFileExtensions: ["tsx", "ts", "js", "jsx"],
	moduleDirectories: ["<rootDir>", "node_modules"],
	moduleNameMapper: {
		"\\.svg\\?react$": "<rootDir>/src/__mocks__/svgMock.js",
		"\\.(css|less|sass|scss)$": "<rootDir>/src/__mocks__/styleMock.js",
		"\\.(svg|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/__mocks__/fileMock.js",
		"@/(.*)$": "<rootDir>/src/$1",
	},
	watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
	modulePaths: ["src"],
	collectCoverageFrom: [
		"src/**",
		"!**/__fixtures__/**",
		"!**/__snapshots__/**",
		"!**/__snapshots__",
		"!**/__tests__/**",
		"!**/models/**",
		"!src/setupTests.ts",
		"!src/testUtils.tsx",
		"!src/types",
	],
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
	transform: {
		"^.+\\.(t|j)sx?$": [
			"@swc/jest",
			{
				jsc: {
					transform: {
						react: {
							runtime: "automatic",
						},
					},
				},
			},
		],
	},
	transformIgnorePatterns: ["node_modules/(?!(d3|internmap|delaunator|robust-predicates))"],
	coverageThreshold: {
		global: {
			lines: 90,
			statements: 90,
		},
	},
};
