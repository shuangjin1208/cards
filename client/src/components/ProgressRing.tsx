import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
}

export function ProgressRing({ 
  progress, 
  size = 240, 
  strokeWidth = 16,
  label,
  subLabel 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center max-w-[80vw] aspect-square" style={{ width: size, height: size }}>
      {/* Background Track */}
      <svg className="absolute transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-muted stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Fill */}
        <motion.circle
          className="text-primary stroke-current"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      {/* Inner Content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && <span className="text-4xl font-bold text-foreground font-display">{label}</span>}
        {subLabel && <span className="text-sm font-medium text-muted-foreground mt-1">{subLabel}</span>}
      </div>
    </div>
  );
}
