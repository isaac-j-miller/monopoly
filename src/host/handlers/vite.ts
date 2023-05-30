import path from "path";
import { createServer } from "vite";

export async function getVite(port: number) {
  const root = path.resolve(__dirname, "../../..");
  const common = path.resolve(root, "src/common");
  const web = path.resolve(root, "src/web");
  const vite = await createServer({
    root: web,
    base: "/",
    server: {
      hmr: {
        port: port + 1,
      },
      middlewareMode: true,
      port,
    },
    appType: "custom",
    resolve: {
      alias: {
        common,
        web,
      },
    },
  });
  return vite;
}
