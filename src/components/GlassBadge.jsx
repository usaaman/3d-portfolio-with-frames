export default function GlassBadge({ children, className = '', ref, ...props }) {
  const baseClasses = 'inline-flex items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-ds-small px-ds-16 py-ds-8 text-ds-caption font-ds-mono text-ds-text-secondary hover:text-ds-accent-secondary hover:border-ds-accent-secondary/30 transition-colors duration-ds-fast';
  
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <span ref={ref} className={combinedClasses} {...props}>
      {children}
    </span>
  );
}

