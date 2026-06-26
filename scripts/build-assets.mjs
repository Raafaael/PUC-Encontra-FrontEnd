import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const distDir = resolve(root, "dist");
const cssTarget = resolve(distDir, "styles.css");
const indexTarget = resolve(distDir, "index.html");
const runtimeConfigTarget = resolve(distDir, "runtime-config.js");
const apiBaseUrl = (process.env.PUC_ENCONTRA_API_URL || "").trim().replace(/\/+$/, "");

mkdirSync(dirname(cssTarget), { recursive: true });
copyFileSync(resolve(root, "src", "styles.css"), cssTarget);

const indexHtml = readFileSync(resolve(root, "index.html"), "utf8")
  .replace("/dist/styles.css", "/styles.css")
  .replace("/dist/runtime-config.js", "/runtime-config.js")
  .replace("/dist/main.js", "/main.js");

writeFileSync(indexTarget, indexHtml);
writeFileSync(
  runtimeConfigTarget,
  `window.PUC_ENCONTRA_CONFIG = { apiBaseUrl: ${JSON.stringify(apiBaseUrl)} };\n`,
);
