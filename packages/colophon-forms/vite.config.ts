import { createLibViteConfig } from "../../tools/config/vite-lib.base";

export default createLibViteConfig({
  dirname: import.meta.dirname,
  external: ["react", "react-dom", "react-aria-components", "@tanstack/react-form", "zod"],
});
