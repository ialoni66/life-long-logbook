// Adds iOS Home Screen (PWA) support to the Expo web export in dist/.
const fs = require("fs");
const path = require("path");

const BASE = "/life-long-logbook"; // must match experiments.baseUrl in app.json
const dist = path.join(__dirname, "..", "dist");

fs.copyFileSync(path.join(__dirname, "..", "assets", "icon.png"), path.join(dist, "apple-touch-icon.png"));

fs.writeFileSync(
  path.join(dist, "manifest.webmanifest"),
  JSON.stringify({
    name: "Life-long Logbook",
    short_name: "Logbook",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#1b2130",
    theme_color: "#1b2130",
    icons: [{ src: `${BASE}/apple-touch-icon.png`, sizes: "1024x1024", type: "image/png" }],
  })
);

const tags = `
<link rel="manifest" href="${BASE}/manifest.webmanifest">
<link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Logbook">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="color-scheme" content="dark">
<style>html,body{background:#1b2130}</style>`;

const file = path.join(dist, "index.html");
let html = fs.readFileSync(file, "utf8");
html = html.replace("</head>", `${tags}\n</head>`);
html = html.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">');
fs.writeFileSync(file, html);

fs.writeFileSync(path.join(dist, ".nojekyll"), "");
console.log("postbuild done");
