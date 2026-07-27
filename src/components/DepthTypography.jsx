/**
 * ==========================================
 * DESIGN SYSTEM DEPTH TYPOGRAPHY
 * ==========================================
 */

/**
 * DepthTypography renders oversized, extremely low-opacity background lettering
 * to establish architectural depth in the environment.
 *
 * @param {Object} props
 * @param {string} props.text - The background text to display
 * @param {string} props.className - Custom Tailwind classes for positioning
 * @returns {JSX.Element}
 */
export default function DepthTypography({ text, className = '', ...props }) {
  const baseClasses = 'absolute pointer-events-none select-none font-ds-display font-weight-ds-bold leading-[0.9] text-[22vw] text-ds-text-primary tracking-ds-tighter uppercase';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <div
      className={combinedClasses}
      style={{
        opacity: 0.015,
        userSelect: 'none',
        ...props.style
      }}
      {...props}
    >
      {text}
    </div>
  );
}
