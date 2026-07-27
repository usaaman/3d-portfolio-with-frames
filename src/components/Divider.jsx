export default function Divider({ className = '', vertical = false, ref, ...props }) {
  const orientationClasses = vertical
    ? 'w-[1px] h-full bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.08)] to-transparent'
    : 'h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent';

  const combinedClasses = `block border-none ${orientationClasses} ${className}`.trim();

  return <hr ref={ref} className={combinedClasses} {...props} />;
}

