// Original technical build icon. This is not the official GOAT Tweaks logo.
// Produces the SVG source and a 64px ICO from the same deterministic pixel grid.
import { writeFileSync } from "node:fs";

const size = 64;
const scale = 4;
const foreground = [13, 13, 15, 255];
const background = [245, 184, 61, 255];
const glyphs = [
  ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
];
const points = new Set();
const rectangles = [];
for (const [glyphIndex, glyph] of glyphs.entries()) {
  for (const [row, pattern] of glyph.entries()) {
    for (const [column, pixel] of [...pattern].entries()) {
      if (pixel !== "1") continue;
      const x = 10 + glyphIndex * 24 + column * scale;
      const y = 18 + row * scale;
      rectangles.push(`<rect x="${x}" y="${y}" width="${scale}" height="${scale}"/>`);
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) points.add((y + dy) * size + x + dx);
      }
    }
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><title>GH — temporary technical build icon</title><rect width="64" height="64" fill="#f5b83d"/><g fill="#0d0d0f">${rectangles.join("")}</g></svg>\n`;
writeFileSync(new URL("./icon.svg", import.meta.url), svg);

const pixelBytes = size * size * 4;
const maskBytes = size * Math.ceil(size / 32) * 4;
const dibLength = 40 + pixelBytes + maskBytes;
const ico = Buffer.alloc(22 + dibLength);
ico.writeUInt16LE(1, 2); // ICO type
ico.writeUInt16LE(1, 4); // one image
ico[6] = size;
ico[7] = size;
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(dibLength, 14);
ico.writeUInt32LE(22, 18);
ico.writeUInt32LE(40, 22);
ico.writeInt32LE(size, 26);
ico.writeInt32LE(size * 2, 30); // XOR and AND planes
ico.writeUInt16LE(1, 34);
ico.writeUInt16LE(32, 36);
ico.writeUInt32LE(pixelBytes + maskBytes, 42);
for (let y = 0; y < size; y += 1) {
  for (let x = 0; x < size; x += 1) {
    const color = points.has(y * size + x) ? foreground : background;
    const offset = 62 + ((size - 1 - y) * size + x) * 4;
    ico.set([color[2], color[1], color[0], color[3]], offset);
  }
}
writeFileSync(new URL("./icon.ico", import.meta.url), ico);
