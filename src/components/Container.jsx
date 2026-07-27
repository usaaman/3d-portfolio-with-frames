export default function Container({ children, className = '', as: Component = 'div', grid = false, ...props }) {
  const baseClasses = 'ds-container';
  // If grid is true, applies a responsive grid that matches the design docs:
  // 12 Columns on desktop, gap-6 (24px) spacing.
  const gridClasses = grid ? 'grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6' : '';
  const combinedClasses = `${baseClasses} ${gridClasses} ${className}`.trim();

  return (
    <Component className={combinedClasses} {...props}>
      {children}
    </Component>
  );
}
