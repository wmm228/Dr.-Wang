import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "dist");

const includePaths = [
  "about.html",
  "article.html",
  "blogs.html",
  "gallery.html",
  "index.html",
  "lab.html",
  "resources.html",
  "tags.html",
  "blog",
  "pdf",
  "posts",
  "resume",
  "static",
  "tags",
];

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const item of includePaths) {
  const source = path.join(projectRoot, item);
  if (!existsSync(source)) {
    throw new Error(`Missing required path: ${source}`);
  }

  const destination = path.join(outputDir, item);
  cpSync(source, destination, { recursive: true });
}

console.log(`Cloudflare Pages output ready: ${outputDir}`);
