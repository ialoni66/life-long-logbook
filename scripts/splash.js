// The loading screen: the Rolodex logo with its ring of cards slowly spinning, so the cards
// sweep past like someone flipping through them. It is plain SVG and CSS, no images and no
// scripts to wait for, so it can sit in the page's HTML and appear the instant the page opens.
// postbuild.js injects it; the app hides it once it is ready (see App.tsx).

const H = { x: 512, y: 430 }; // hub of the wheel
const pt = (deg, r) => {
  const a = (deg * Math.PI) / 180; // 0 = straight up, clockwise
  return [H.x + r * Math.sin(a), H.y - r * Math.cos(a)];
};
const f = (n) => n.toFixed(1);
const sector = (a1, a2, r) => {
  const [x1, y1] = pt(a1, r);
  const [x2, y2] = pt(a2, r);
  return `M${H.x} ${H.y} L${f(x1)} ${f(y1)} A${r} ${r} 0 0 1 ${f(x2)} ${f(y2)} Z`;
};

// the same small random generator every time, so the card edges look identical on every build
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const COLORS = {
  cards: ["#f4ecc2", "#6ea6ff", "#e3d8a0", "#a9b8dc", "#f4f6fb", "#d9cd92"],
  gap: "#1b2130", wood: "#7a4f33", woodDark: "#4a2f20", grain: "#4a2f20", grainLight: "#9a6a47",
  back: "#4a2f20", trim: "#f4ecc2", neck: "#5a3a26", neckEdge: "#2e1c12", base: "#e3d8a0", baseSide: "#b8ad78",
};

function ring() {
  // cards all the way around the wheel; the panel hides the lower ones as they turn
  let s = "";
  const count = 72;
  for (let i = 0; i < count; i++) {
    const ang = (360 / count) * i + (rnd() - 0.5) * 2;
    const outlier = rnd() < 0.12 ? (rnd() - 0.5) * 60 : 0;
    const len = 268 + (rnd() - 0.5) * 26 + outlier;
    const w = 15 + rnd() * 4;
    const col = COLORS.cards[i % COLORS.cards.length];
    // drawn around the point (0, 0), which the group below places on the hub
    s += `<rect x="${f(-w / 2)}" y="${f(-len)}" width="${f(w)}" height="${f(len - 100)}" rx="3.5" fill="${col}" stroke="${COLORS.gap}" stroke-width="2" transform="rotate(${f(ang)})"/>`;
  }
  return s;
}

function grain() {
  let s = "";
  for (let k = 0; k < 13; k++) {
    const y = 330 + k * 34 + (rnd() - 0.5) * 12;
    const sway = (rnd() - 0.5) * 50;
    s += `<path d="M120 ${f(y)} C 340 ${f(y + sway)}, 640 ${f(y - sway)}, 910 ${f(y + sway / 2)}" stroke="${k % 2 ? COLORS.grainLight : COLORS.grain}" stroke-width="${f(3 + rnd() * 4)}" opacity="${f(0.55 + rnd() * 0.3)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

const panel = sector(124, 236, 300);
const back = sector(56, 128, 306);
const RING_ID = "rx-ring";

const svg = `<svg viewBox="130 110 764 800" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><clipPath id="rx-panel"><path d="${panel}"/></clipPath></defs>
  <rect x="446" y="680" width="132" height="140" fill="${COLORS.neck}" stroke="${COLORS.neckEdge}" stroke-width="6"/>
  <ellipse cx="512" cy="846" rx="262" ry="50" fill="${COLORS.baseSide}"/>
  <ellipse cx="512" cy="826" rx="262" ry="50" fill="${COLORS.base}"/>
  <ellipse cx="512" cy="826" rx="226" ry="38" fill="none" stroke="#8e8451" stroke-width="5" opacity="0.7"/>
  <g transform="translate(${H.x} ${H.y})"><g id="${RING_ID}" class="rx-spin">${ring()}</g></g>
  <path d="${back}" fill="${COLORS.back}" stroke="${COLORS.trim}" stroke-width="10" stroke-linejoin="round"/>
  <path d="${panel}" fill="${COLORS.wood}"/>
  <g clip-path="url(#rx-panel)">${grain()}</g>
  <path d="${panel}" fill="none" stroke="${COLORS.trim}" stroke-width="22" stroke-linejoin="round"/>
  <circle cx="${H.x}" cy="${H.y}" r="98" fill="${COLORS.woodDark}"/>
  <circle cx="${H.x}" cy="${H.y}" r="98" fill="none" stroke="${COLORS.trim}" stroke-width="24"/>
</svg>`;

const css = `
#rx-splash{position:fixed;top:0;right:0;bottom:0;left:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:radial-gradient(ellipse at 50% 38%,#27324b 0%,#1b2130 72%);opacity:1;transition:opacity .45s ease}
#rx-splash.rx-hide{opacity:0;pointer-events:none}
#rx-splash svg{display:block;width:min(64vw,300px);height:auto;overflow:visible}
#rx-splash .rx-name{font-family:Lora,Georgia,'Times New Roman',serif;font-weight:700;font-size:30px;letter-spacing:.04em;color:#f4ecc2;animation:rx-pulse 2.4s ease-in-out infinite}
@keyframes rx-pulse{0%,100%{opacity:.6}50%{opacity:1}}
#rx-splash .rx-slow{max-width:80vw;text-align:center;font-family:Lora,Georgia,'Times New Roman',serif;font-size:14px;line-height:1.4;color:#b4bdd0;opacity:0;animation:rx-late .6s ease 20s forwards}
@keyframes rx-late{to{opacity:1}}
#rx-splash .rx-spin{animation:rx-spin 5.5s linear infinite}
@keyframes rx-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){#rx-splash .rx-name,#rx-splash .rx-spin{animation:none}}
`.replace(/\n/g, "");

// A CSS animation starts on the very first paint, even while the app's code is still downloading
// (an SVG-internal animation would not start until the whole page had loaded). The ring turns around
// (0, 0) of the group it sits in, which is placed on the hub, so no transform-origin is needed.
const html = `<div id="rx-splash" role="status" aria-label="Loading Rolodex">${svg}<div class="rx-name">Rolodex</div><div class="rx-slow">Taking longer than usual. Please check your connection.</div></div>`;

module.exports = { css, html };
