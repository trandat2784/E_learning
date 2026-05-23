import React from 'react';

interface HeartIconProps {
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
  className?: string;
  onClick?: () => void;
}

const HeartIcon = ({ 
  width = 24, 
  height = 24, 
  color = "currentColor",
  filled = false,
  className,
  onClick
}: HeartIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        stroke={color}
        strokeWidth="1.5"
        fill={filled ? color : "none"}
      />
    </svg>
  );
};

export default HeartIcon;