import type React from "react";

export interface WebSheetLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Explicit square dimension in pixels or CSS dimension string (defaults to 24).
   * Can also be controlled via Tailwind classes (e.g. `className="w-8 h-8"`).
   */
  size?: number | string;
  /**
   * Custom CSS classes applied directly to the root <svg> element.
   */
  className?: string;
  /**
   * Accessible title when the logo is rendered standalone without adjacent text.
   * When provided, role="img" is applied and a <title> element is rendered.
   * When omitted (default when paired with "WebSheet" text), aria-hidden="true" is set.
   */
  title?: string;
  /**
   * Accessible label override for assistive technologies.
   */
  "aria-label"?: string;
}

export const WebSheetLogo: React.FC<WebSheetLogoProps> = ({
  size = 24,
  className = "",
  title,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHiddenProp,
  role: roleProp,
  ...props
}) => {
  const hasAccessibleName = Boolean(title || ariaLabel);
  const ariaHidden = ariaHiddenProp ?? (hasAccessibleName ? undefined : true);
  const role = roleProp ?? (hasAccessibleName ? "img" : undefined);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={role}
      aria-label={ariaLabel || (title ? title : undefined)}
      aria-hidden={ariaHidden}
      {...props}
    >
      {title && <title>{title}</title>}
      <rect
        width="20"
        height="20"
        x="2"
        y="2"
        rx="4"
        fill="#2563eb"
        className="fill-blue-600 transition-colors group-hover:fill-blue-700"
      />
      <rect width="7" height="4" x="5" y="6" rx="1" fill="#ffffff" />
      <rect width="7" height="4" x="13" y="6" rx="1" fill="#ffffff" fillOpacity="0.8" />
      <rect width="7" height="4" x="5" y="11" rx="1" fill="#ffffff" fillOpacity="0.8" />
      <rect width="7" height="4" x="13" y="11" rx="1" fill="#ffffff" />
      <rect width="7" height="4" x="5" y="16" rx="1" fill="#ffffff" />
      <rect width="7" height="4" x="13" y="16" rx="1" fill="#ffffff" fillOpacity="0.8" />
    </svg>
  );
};

export { WebSheetLogo as LogoIcon };
