// Adds iOS Home Screen (PWA) support to the Expo web export in dist/.
const fs = require("fs");
const path = require("path");

const BASE = "/life-long-logbook"; // must match experiments.baseUrl in app.json
const dist = path.join(__dirname, "..", "dist");

// Icons come from assets/ (the walnut card-file logo). iPhone uses the 180px apple-touch-icon.
const assets = path.join(__dirname, "..", "assets");
for (const name of ["apple-touch-icon.png", "icon-192.png", "icon-512.png"]) {
  fs.copyFileSync(path.join(assets, name), path.join(dist, name));
}

fs.writeFileSync(
  path.join(dist, "manifest.webmanifest"),
  JSON.stringify({
    name: "Rolodex",
    short_name: "Rolodex",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#1b2130",
    theme_color: "#1b2130",
    icons: [
      { src: `${BASE}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  })
);

const splash = require("./splash");

const tags = `
<link rel="manifest" href="${BASE}/manifest.webmanifest">
<link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Rolodex">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="color-scheme" content="dark">
<style>html,body{background:#1b2130}${splash.css}</style>`;

const file = path.join(dist, "index.html");
let html = fs.readFileSync(file, "utf8");
html = html.replace("</head>", `${tags}\n</head>`);
html = html.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">');
// The loading screen goes straight after <body>, outside the app's own #root, so it shows the
// moment the page opens and is not wiped when the app starts drawing. App.tsx hides it later.
const withSplash = html.replace(/<body[^>]*>/, (open) => `${open}\n${splash.html}`);
if (withSplash === html) throw new Error("postbuild: could not find <body> to place the loading screen");
html = withSplash;
fs.writeFileSync(file, html);

fs.writeFileSync(path.join(dist, ".nojekyll"), "");
console.log("postbuild done");
