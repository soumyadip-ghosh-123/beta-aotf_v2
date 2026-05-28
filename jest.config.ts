import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    // Resolve @/ alias to project root
    "^@/(.*)$": "<rootDir>/$1",
  },
  // Only run tests in lib/services/__tests__ by default
  testMatch: ["<rootDir>/lib/services/__tests__/**/*.test.ts"],
  // ts-jest config: override module to commonjs (project uses esnext)
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
        },
        diagnostics: false,
      },
    ],
  },
};

export default config;
