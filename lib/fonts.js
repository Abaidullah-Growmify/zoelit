import { API_URL } from "@/lib/api";

export const FONT_OPTIONS = [
  { value: "inter", label: "Inter", family: "var(--font-inter)" },
  { value: "poppins", label: "Poppins", family: "var(--font-poppins)" },
  { value: "roboto", label: "Roboto", family: '"Roboto", sans-serif' },
  { value: "open-sans", label: "Open Sans", family: '"Open Sans", sans-serif' },
  { value: "lato", label: "Lato", family: '"Lato", sans-serif' },
  { value: "montserrat", label: "Montserrat", family: '"Montserrat", sans-serif' },
  { value: "nunito", label: "Nunito", family: '"Nunito", sans-serif' },
  { value: "raleway", label: "Raleway", family: '"Raleway", sans-serif' },
  { value: "dm-sans", label: "DM Sans", family: '"DM Sans", sans-serif' },
  { value: "manrope", label: "Manrope", family: '"Manrope", sans-serif' },
  { value: "playfair-display", label: "Playfair Display", family: '"Playfair Display", serif' },
  { value: "merriweather", label: "Merriweather", family: '"Merriweather", serif' },
  { value: "roboto-slab", label: "Roboto Slab", family: '"Roboto Slab", serif' },
  { value: "source-code-pro", label: "Source Code Pro", family: '"Source Code Pro", monospace' },
  { value: "arial", label: "Arial", family: "Arial, sans-serif" },
  { value: "helvetica", label: "Helvetica", family: "Helvetica, Arial, sans-serif" },
  { value: "verdana", label: "Verdana", family: "Verdana, sans-serif" },
  { value: "trebuchet-ms", label: "Trebuchet MS", family: '"Trebuchet MS", sans-serif' },
  { value: "georgia", label: "Georgia", family: "Georgia, serif" },
  { value: "times-new-roman", label: "Times New Roman", family: '"Times New Roman", serif' },
  { value: "ubuntu", label: "Ubuntu", family: "Ubuntu, sans-serif" },
  { value: "rubik", label: "Rubik", family: "Rubik, sans-serif" },
  { value: "quicksand", label: "Quicksand", family: "Quicksand, sans-serif" },
  { value: "fira-sans", label: "Fira Sans", family: "Fira Sans, sans-serif" },
  { value: "work-sans", label: "Work Sans", family: "Work Sans, sans-serif" },
  { value: "noto-sans", label: "Noto Sans", family: "Noto Sans, sans-serif" },
  { value: "ibm-plex-sans", label: "IBM Plex Sans", family: "IBM Plex Sans, sans-serif" },
  { value: "oswald", label: "Oswald", family: "Oswald, sans-serif" },
  { value: "libre-baskerville", label: "Libre Baskerville", family: "Libre Baskerville, serif" },
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
  return option ? option.family : null;
}

export function applyFontTheme(heading = DEFAULT_FONTS.heading, body = DEFAULT_FONTS.body) {
  if (typeof document === "undefined") return;
  const headingSource = resolveSource("heading", heading);
  const bodySource = resolveSource("body", body);
  const root = document.documentElement;
  if (headingSource) root.style.setProperty("--font-display", headingSource);
  if (bodySource) root.style.setProperty("--font-body", bodySource);
}
