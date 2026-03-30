"use strict";
/**
 * Vercel (Linux x64, glibc) only: npm sometimes omits Rollup's optional
 * @rollup/rollup-linux-x64-gnu (npm/cli#4828). Install it if missing.
 * Exits immediately on macOS/Windows so local `npm ci` is unaffected.
 *
 * May live at repo `scripts/` or `src/scripts/` depending on package root.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

if (process.platform !== "linux" || process.arch !== "x64") {
  process.exit(0);
}

/** Directory that contains node_modules/rollup (npm package root). */
function findProjectRoot() {
  let dir = path.resolve(__dirname);
  for (let i = 0; i < 14; i++) {
    const rollupPkg = path.join(dir, "node_modules", "rollup", "package.json");
    if (fs.existsSync(rollupPkg)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  console.error(
    "ensure-rollup-linux-native: could not find node_modules/rollup (wrong cwd or install failed)"
  );
  process.exit(1);
}

const root = findProjectRoot();
const nativeMarker = path.join(
  root,
  "node_modules",
  "@rollup",
  "rollup-linux-x64-gnu",
  "package.json"
);
if (fs.existsSync(nativeMarker)) {
  process.exit(0);
}

const rollupPkgPath = path.join(root, "node_modules", "rollup", "package.json");
if (!fs.existsSync(rollupPkgPath)) {
  console.error("ensure-rollup-linux-native: rollup not installed after npm ci");
  process.exit(1);
}

const v = JSON.parse(fs.readFileSync(rollupPkgPath, "utf8")).version;
console.warn(
  `[ensure-rollup-linux-native] Installing @rollup/rollup-linux-x64-gnu@${v} (npm optional-deps workaround)`
);
execSync(`npm install @rollup/rollup-linux-x64-gnu@${v} --no-save --ignore-scripts`, {
  stdio: "inherit",
  cwd: root,
});
