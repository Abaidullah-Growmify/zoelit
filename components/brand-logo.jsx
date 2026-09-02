import Image from "next/image";

const LIGHT_LOGO = "https://res.cloudinary.com/erspxhnu/image/upload/v1788352762/Zoelit_logo_light_mode.jpg";
const DARK_LOGO = "https://res.cloudinary.com/erspxhnu/image/upload/v1788352855/Zoelit_logo_dark_mode.png";

export function BrandLogo({ alt = "ZoeLit", className = "", priority = false, variant = "auto" }) {
  const props = {
    width: 2000,
    height: 357,
    priority,
    className: `h-auto ${className}`,
  };

  if (variant === "light") return <Image {...props} src={LIGHT_LOGO} alt={alt} />;
  if (variant === "dark") return <Image {...props} src={DARK_LOGO} alt={alt} />;

  return (
    <>
      <Image {...props} src={LIGHT_LOGO} alt={alt} className={`h-auto dark:hidden ${className}`} />
      <Image {...props} src={DARK_LOGO} alt={alt} className={`hidden h-auto dark:block ${className}`} />
    </>
  );
}
