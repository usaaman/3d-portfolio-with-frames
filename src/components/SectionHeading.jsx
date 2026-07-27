export default function SectionHeading({
  children,
  className = '',
  as: Component = 'h2',
  align = 'left',
  ref,
  ...props
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const baseClasses = 'font-ds-display font-weight-ds-bold text-ds-card md:text-ds-section leading-ds-heading tracking-ds-tight text-ds-text-primary';
  const combinedClasses = `${baseClasses} ${alignClasses[align]} ${className}`.trim();

  return (
    <Component ref={ref} className={combinedClasses} {...props}>
      {children}
    </Component>
  );
}

