import React from 'react';

// Reusable Button Component
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
  className?: string;
  onClick?: () => void;
  icon?: React.ComponentType<any>;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick, 
  icon: Icon,
  type = 'button'
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30",
    secondary: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30",
    ghost: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

// Reusable Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

// Reusable Badge Component
interface BadgeProps {
  children: React.ReactNode;
  type?: 'success' | 'danger' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, type = 'neutral' }) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[type]}`}>{children}</span>;
};

// Skeleton Loader Component
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`}></div>
);

// Sparkline Chart Component (Simple SVG)
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color = "#4f46e5", height = 50 }) => {
  const points = data.map((d, i) => `${i * (100 / (data.length - 1))},${50 - (d * 50)}`).join(' ');
  return (
    <svg width="100%" height={height} viewBox="0 0 100 50" preserveAspectRatio="none" className="overflow-visible">
      <path d={`M0,50 L${points} L100,50 Z`} fill={color} fillOpacity="0.1" />
      <path d={`M${points}`} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};
