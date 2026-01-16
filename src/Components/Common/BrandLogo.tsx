import { useTheme } from "@/Store/contexts/ThemeContext";
import newageLogoWhite from "@/assets/newage-logo-white.png";

interface BrandLogoProps {
  className?: string;
  tenantLogoLight?: string;
  tenantLogoDark?: string;
  alt?: string;
  /** Force white logo variant (for dark backgrounds regardless of theme) */
  forceWhite?: boolean;
}

/**
 * Dynamic white-label logo component
 * - Uses tenant logo if provided
 * - Falls back to Newage logo
 * - Always uses white logo on dark backgrounds (header, login panel)
 */
const BrandLogo = ({
  className = "h-10 w-auto",
  tenantLogoLight,
  tenantLogoDark,
  alt = "Company Logo",
  forceWhite = false,
}: BrandLogoProps) => {
  const { theme } = useTheme();

  // Determine which logo to use
  // For headers and dark backgrounds, always use white variant
  const getLogo = () => {
    if (forceWhite || theme === "dark") {
      return tenantLogoDark || newageLogoWhite;
    }
    // Light mode on light backgrounds - still use white logo as per brand
    // The newage logo with white text works on twilight/grey-blue backgrounds
    return tenantLogoLight || newageLogoWhite;
  };

  return (
    <img
      src={getLogo()}
      alt={alt}
      className={`object-contain transition-opacity duration-200 ${className}`}
    />
  );
};

export default BrandLogo;
