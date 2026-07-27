export default function GlowLayer({ children, className = '', ref, ...props }) {
  return (
    <div ref={ref} className={`absolute inset-0 pointer-events-none overflow-hidden rounded-inherit ${className}`} {...props}>
      {/* Top Left Primary Soft Light (Faint Blue tint for depth) */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.06),transparent_70%)]" />
      
      {/* Bottom Right Secondary Bounce Light (Faint Cyan tint) */}
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[radial-gradient(circle_at_bottom_right,rgba(101,214,255,0.04),transparent_70%)]" />
      
      {/* Center Soft Ambient Light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_80%)]" />
      
      {children}
    </div>
  );
}

