import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.js", "./tests/integration/setup.js"],
    include: ["tests/integration/**/*.test.js"],
  },
});
