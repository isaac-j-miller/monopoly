import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default async () => {
  return defineConfig({
    root: ".",
    build: {
      rollupOptions: {
        output: { dir: "./dist" },
      },
    },
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
      }),
      tsconfigPaths({
        root: "../..",
      }),
    ],
    base: "/",
    resolve: {
      alias: {
        common: "src/common",
        web: "src/web",
      },
    },
  });
};
