import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#efe7d1",
  paper: "#fff9eb",
  label: "#f8f0dc",
  ink: "#1f1b17",
  red: "#b73535",
  gold: "#f1bf42",
  green: "#e3efe1",
  olive: "#476345",
  brown: "#7b5b2d",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function baseFrame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <path d="M0 0H1284V242H0Z" fill="${c.ink}"/>
    <path d="M80 390H1204M80 770H1204M80 1150H1204M80 1530H1204M80 1910H1204M80 2290H1204" stroke="rgba(31,27,23,0.08)" stroke-width="4"/>
    <circle cx="1148" cy="2480" r="250" fill="${c.gold}" opacity="0.35"/>
    ${content}
  </svg>`;
}

function titleBlock(title, sub) {
  return `
    <text x="72" y="103" font-family="Courier New, monospace" font-size="30" font-weight="900" fill="${c.gold}">TINY MUSEUM</text>
    <text x="72" y="202" font-family="Arial, sans-serif" font-size="76" font-weight="900" fill="${c.paper}">${esc(title)}</text>
    <text x="78" y="318" font-family="Arial, sans-serif" font-size="33" font-weight="800" fill="${c.brown}">${esc(sub)}</text>
  `;
}

function labelCard(x, y, name, category, era, label) {
  const lines = wrap(label, 34).slice(0, 5);
  return `
    <rect x="${x}" y="${y}" width="1060" height="1040" rx="22" fill="${c.paper}" stroke="${c.ink}" stroke-width="6"/>
    <rect x="${x}" y="${y}" width="1060" height="36" rx="18" fill="${c.red}"/>
    <text x="${x + 58}" y="${y + 104}" font-family="Courier New, monospace" font-size="25" font-weight="900" fill="${c.brown}">OBJECT LABEL</text>
    <text x="${x + 58}" y="${y + 220}" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.ink}">${esc(name)}</text>
    <rect x="${x + 58}" y="${y + 296}" width="292" height="140" rx="18" fill="${c.ink}"/>
    <text x="${x + 86}" y="${y + 350}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.gold}">CATEGORY</text>
    <text x="${x + 86}" y="${y + 410}" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="${c.paper}">${esc(category)}</text>
    <rect x="${x + 380}" y="${y + 296}" width="275" height="140" rx="18" fill="${c.gold}" stroke="${c.ink}" stroke-width="4"/>
    <text x="${x + 408}" y="${y + 350}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="#7a5511">ERA</text>
    <text x="${x + 408}" y="${y + 410}" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="${c.ink}">${esc(era)}</text>
    <rect x="${x + 685}" y="${y + 296}" width="278" height="140" rx="18" fill="${c.green}" stroke="${c.ink}" stroke-width="4"/>
    <text x="${x + 713}" y="${y + 350}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.olive}">CHAIN</text>
    <text x="${x + 713}" y="${y + 410}" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="${c.ink}">Base</text>
    <rect x="${x + 58}" y="${y + 520}" width="944" height="320" rx="18" fill="${c.label}" stroke="${c.ink}" stroke-width="4"/>
    <text x="${x + 90}" y="${y + 584}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.red}">CURATOR NOTE</text>
    ${lines.map((line, i) => `<text x="${x + 90}" y="${y + 648 + i * 44}" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="${c.ink}">${esc(line)}</text>`).join("")}
    <rect x="${x + 58}" y="${y + 900}" width="944" height="76" rx="18" fill="${c.ink}"/>
    <text x="${x + 90}" y="${y + 949}" font-family="Courier New, monospace" font-size="23" font-weight="900" fill="${c.gold}">CURATOR WALLET + TIMESTAMP STORED ON BASE</text>
  `;
}

function feature(x, y, title, body, fill) {
  return `
    <rect x="${x}" y="${y}" width="540" height="220" rx="22" fill="${fill}" stroke="${c.ink}" stroke-width="5"/>
    <text x="${x + 34}" y="${y + 78}" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    ${wrap(body, 30).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 132 + i * 34}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="${c.brown}">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return baseFrame(`
    ${titleBlock("Curate tiny objects.", "Save a museum-style object label on Base.")}
    ${labelCard(112, 500, "Brass Train Ticket", "Artifact", "Found 2019", "A pocket-sized ticket from a late train ride. The stamp is faded, but the date still feels like a tiny proof of motion.")}
    ${feature(72, 1710, "Write the label", "Name, category, era, and story.", c.paper)}
    ${feature(672, 1710, "Save on Base", "Wallet and timestamp stay public.", c.green)}
  `);
}

function screenshot2() {
  return baseFrame(`
    ${titleBlock("Build a pocket archive.", "Every object gets a clean card and ID.")}
    ${feature(72, 430, "Object ID", "Reopen saved labels by number.", c.gold)}
    ${feature(672, 430, "Curator wallet", "See who filed the object.", c.paper)}
    ${labelCard(112, 800, "Blue Receipt", "Keepsake", "Recent", "A receipt kept for the handwriting on the back. It marks a small lunch, a big decision, and a walk home in rain.")}
  `);
}

function screenshot3() {
  return baseFrame(`
    ${titleBlock("A tiny public exhibit.", "Turn personal items into readable onchain records.")}
    ${labelCard(112, 430, "Pocket Compass", "Tool", "Vintage", "The needle still turns, even though the hinge barely closes. It belongs to the drawer of things that keep pointing somewhere.")}
    ${feature(72, 1650, "BaseScan link", "Check the transaction after saving.", c.green)}
    ${feature(672, 1650, "Mobile first", "Made for quick app browsing.", c.gold)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="150" y="118" width="724" height="788" rx="54" fill="${c.paper}" stroke="${c.ink}" stroke-width="30"/>
    <rect x="150" y="118" width="724" height="96" rx="48" fill="${c.red}"/>
    <path d="M298 376H726M298 504H620M298 632H710" stroke="${c.ink}" stroke-width="42" stroke-linecap="round"/>
    <rect x="294" y="722" width="438" height="74" rx="20" fill="${c.gold}" stroke="${c.ink}" stroke-width="18"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <rect x="0" y="0" width="1910" height="176" fill="${c.ink}"/>
    <text x="96" y="128" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="${c.paper}">Tiny Museum</text>
    <text x="104" y="250" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="${c.brown}">Save object labels on Base.</text>
    ${feature(106, 370, "Object label", "Name, category, era, story.", c.paper)}
    ${feature(106, 635, "Onchain archive", "Curator and timestamp saved.", c.green)}
    ${labelCard(760, 244, "Brass Train Ticket", "Artifact", "Found 2019", "A pocket-sized ticket from a late train ride. The stamp is faded, but the date still feels like a tiny proof of motion.")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2), "utf8");
await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Tiny Museum",
    "",
    "App Name: Tiny Museum",
    "Tagline: Curate tiny objects",
    "Description: Save an object label with name, category, era, wallet, and timestamp on Base.",
    "",
    "Domain: https://tiny-museum.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
