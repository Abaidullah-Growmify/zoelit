import { API_URL } from "@/lib/api";

export const FONT_OPTIONS = [
  { value: "inter", label: "Inter", variable: "--font-inter" },
  { value: "poppins", label: "Poppins", variable: "--font-poppins" },
];

export const DEFAULT_FONTS = { heading: "poppins", body: "inter" };

const VALID_FORMATS = ["woff2", "woff", "truetype", "opentype"];
const CUSTOM_FAMILIES = { heading: "Zoelit Custom Heading", body: "Zoelit Custom Body" };
const registeredFaces = { heading: null, body: null };

export function fontOption(value) {
  return FONT_OPTIONS.find((option) => option.value === value) || null;
}

export function parseCustomFont(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.fileId === "string" && parsed.fileId) return parsed;
  } catch {
    return null;
  }
  return null;
}

export function getFontUrl(fileId) {
  return `${API_URL}/api/public/fonts/${encodeURIComponent(fileId)}`;
}

function registerCustomFace(slot, font) {
  if (!font?.fileId) return null;
  const family = CUSTOM_FAMILIES[slot];
  const format = VALID_FORMATS.includes(font.format) ? font.format : "woff2";
  const url = getFontUrl(font.fileId);
  if (registeredFaces[slot]?.fileId === font.fileId) return family;
  if (registeredFaces[slot]) {
    registeredFaces[slot].style.remove();
    registeredFaces[slot] = null;
  }
  const style = document.createElement("style");
  style.textContent = `@font-face{font-family:${JSON.stringify(family)};src:url(${JSON.stringify(url)}) format(${JSON.stringify(format)});font-display:swap;font-weight:100 900;}`;
  document.head.appendChild(style);
  registeredFaces[slot] = { fileId: font.fileId, style };
  return family;
}

function resolveSource(slot, value) {
  const custom = parseCustomFont(value);
  if (custom) return registerCustomFace(slot, custom);
  if (registeredFaces[slot]) {
    registeredFaces[slot].style.remove();
    registeredFaces[slot] = null;
  }
  const option = fontOption(value);
  return option ? `var(${option.variable})` : null;
}

export function applyFontTheme(heading = DEFAULT_FONTS.heading, body = DEFAULT_FONTS.body) {
  if (typeof document === "undefined") return;
  const headingSource = resolveSource("heading", heading);
  const bodySource = resolveSource("body", body);
  const root = document.documentElement;
  if (headingSource) root.style.setProperty("--font-display", headingSource);
  if (bodySource) root.style.setProperty("--font-body", bodySource);
}