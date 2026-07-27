import './ReflectionOverlay.css';

export default function ReflectionOverlay({ className = '', delay = 0, ref, ...props }) {
  return (
    <div 
      ref={ref}
      className={`reflection-overlay-container ${className}`}
      style={{ '--reflection-delay': `${delay}s` }}
      {...props}
    >
      <div className="reflection-line" />
    </div>
  );
}

