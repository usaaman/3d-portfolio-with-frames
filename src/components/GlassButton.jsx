export default function GlassButton({
  children,
  className = '',
  variant = 'primary',
  as: Component = 'button',
  ref,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-ds-8 rounded-ds-button font-ds-body font-weight-ds-medium text-ds-caption md:text-ds-small transition-all ease-ds-out-natural duration-ds-button cursor-pointer disabled:opacity-ds-disabled disabled:pointer-events-none';

  const variantClasses = {
    primary: 'bg-ds-glass-bg border border-ds-glass-border shadow-ds-small text-ds-text-primary hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    secondary: 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-ds-text-secondary hover:bg-[rgba(255,255,255,0.08)] hover:text-ds-text-primary hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    ghost: 'bg-transparent border border-transparent text-ds-text-secondary hover:bg-[rgba(255,255,255,0.04)] hover:text-ds-text-primary active:scale-[0.98]',
  };

  const sizeClasses = 'px-ds-24 py-ds-16';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses} ${className}`.trim();

  return (
    <Component ref={ref} className={combinedClasses} {...props}>
      {children}
    </Component>
  );
}

