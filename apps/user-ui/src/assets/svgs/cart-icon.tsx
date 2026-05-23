import React from 'react';

interface CartIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  badge?: number;
  badgeColor?: string;
  onClick?: () => void;
}

const CartIcon = ({ 
  width = 24, 
  height = 24, 
  color = "currentColor",
  badge,
  badgeColor = "#ff4444",
  className,
  onClick
}: CartIconProps) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <path
          d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.5C20.95 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z"
          fill={color}
        />
      </svg>
      
      {badge && badge > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: badgeColor,
            color: 'white',
            borderRadius: '50%',
            minWidth: '18px',
            height: '18px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            fontWeight: 'bold'
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  );
};

export default CartIcon;