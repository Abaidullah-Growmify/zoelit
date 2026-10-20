import Image from "next/image";

const LIGHT_LOGO = { src: "/zoelit-logo-light-trimmed.png", width: 1318, height: 259 };
const DARK_LOGO = { src: "/zoelit-logo-dark-trimmed.png", width: 1293, height: 233 };

export function BrandLogo({ alt = "ZoeLit", className = "", priority = false, variant = "auto" }) {
  // h-auto only as a fallback: a caller-provided height (h-7, h-9, ...) must win,
  // otherwise the logo expands to fill its container (seen in the admin top bar).
  const heightClass = /\bh-/.test(className) ? "" : "h-auto ";
  const baseProps = { alt, priority, className: `${heightClass}${className}` };

  if (variant === "light") return <Image {...baseProps} {...LIGHT_LOGO} alt={alt} />;
  if (variant === "dark") return <Image {...baseProps} {...DARK_LOGO} alt={alt} />;

  return (
    <>
      <Image {...baseProps} {...LIGHT_LOGO} alt={alt} className={`${heightClass}dark:hidden ${className}`} />
      <Image {...baseProps} {...DARK_LOGO} alt={alt} className={`hidden ${heightClass}dark:block ${className}`} />
    </>
  );
}
