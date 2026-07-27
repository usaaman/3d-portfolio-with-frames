export default function GlassCard({
  children,
  className = '',
  variant = 'medium',
  hoverable = false,
  ref,
  ...props
}) {
  const baseClasses = 'ds-glass transition-all ease-ds-out-natural duration-ds-medium';
  
  // Padding and sizing configurations
  const paddingClasses = {
    small: 'p-[20px] rounded-ds-small md:rounded-ds-medium',
    medium: 'p-[24px] rounded-ds-card',
    large: 'p-[32px] rounded-ds-panel',
  };

  // Hover transitions lift and brightness specifications
  const hoverClasses = hoverable
    ? 'hover:scale-[1.02] hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.18)] hover:shadow-ds-large'
    : '';

  const combinedClasses = `${baseClasses} ${paddingClasses[variant]} ${hoverClasses} ${className}`.trim();

  return (
    <div ref={ref} className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

