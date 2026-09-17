export const CATEGORY_ICONS = [
  { value: "Laptop", label: "Laptops", keywords: ["laptop", "notebook", "computer", "pc"] },
  { value: "Smartphone", label: "Phones", keywords: ["phone", "mobile", "smartphone"] },
  { value: "Tablet", label: "Tablets", keywords: ["tablet", "ipad"] },
  { value: "Monitor", label: "Monitors", keywords: ["monitor", "display", "screen"] },
  { value: "Printer", label: "Printers", keywords: ["printer", "printing", "scanner"] },
  { value: "Router", label: "Routers", keywords: ["network", "router", "switch", "ethernet"] },
  { value: "Wifi", label: "Wi-Fi", keywords: ["wifi", "wireless", "internet"] },
  { value: "Server", label: "Servers", keywords: ["server", "storage", "datacenter"] },
  { value: "Keyboard", label: "Keyboards", keywords: ["keyboard", "typing"] },
  { value: "Mouse", label: "Mice", keywords: ["mouse", "mice"] },
  { value: "Headphones", label: "Headphones", keywords: ["audio", "headphone", "earbud", "speaker"] },
  { value: "Camera", label: "Cameras", keywords: ["camera", "photo", "video"] },
  { value: "Gamepad2", label: "Gaming", keywords: ["gaming", "game", "console"] },
  { value: "Watch", label: "Wearables", keywords: ["watch", "wearable", "fitness"] },
  { value: "Cable", label: "Cables", keywords: ["cable", "adapter", "charger", "accessor"] },
  { value: "Package", label: "Other technology", keywords: [] },
];

export function getCategoryIconOptions(categoryName = "") {
  const name = String(categoryName).toLowerCase();
  const matching = CATEGORY_ICONS.filter((icon) => icon.keywords.some((keyword) => name.includes(keyword)));
  return matching.length ? [...matching, CATEGORY_ICONS[CATEGORY_ICONS.length - 1]] : CATEGORY_ICONS;
}

export function getCategoryIcon(categoryName = "", selectedIcon = "") {
  const options = getCategoryIconOptions(categoryName);
  return selectedIcon && options.some((icon) => icon.value === selectedIcon)
    ? selectedIcon
    : options[0]?.value || "Package";
}
