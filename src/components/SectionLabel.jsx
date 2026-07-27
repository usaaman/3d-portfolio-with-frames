export default function SectionLabel({ children, className = '', ref, ...props }) {
  const baseClasses = 'inline-block font-ds-mono text-ds-caption tracking-ds-wide uppercase text-ds-accent-secondary';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <span ref={ref} className={combinedClasses} {...props}>
      {children}
    </span>
  );
}

