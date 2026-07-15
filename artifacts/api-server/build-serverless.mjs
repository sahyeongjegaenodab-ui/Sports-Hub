import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

// Plugins may use `require` to resolve dependencies.
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

// Output the bundled serverless function into the repo-root `/api` directory,
// where Vercel auto-detects Node.js serverless functions.
const repoRoot = path.resolve(artifactDir, "..", "..");
const outfile = path.resolve(repoRoot, "api", "index.mjs");

async function buildServerless() {
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/serverless.ts")],
    platform: "node",
    target: "node20",
    bundle: true,
    format: "esm",
    outfile,
    logLevel: "info",
    // In production the logger writes plain JSON to stdout (no pino-pretty
    // worker transport), so pino bundles cleanly into a single file without
    // needing the esbuild-plugin-pino worker handling.
    external: ["*.node"],
    sourcemap: false,
    minify: false,
    // Ensure CJS-only packages (e.g. express) keep working inside the ESM
    // output by shimming require / __filename / __dirname.
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });
}

buildServerless().catch((err) => {
  console.error(err);
  process.exit(1);
});
