import React from 'react';

const Loader = ({ size = 32, color = '#1C6C41', className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          .spinner-bar {
            animation: spinner-fade 1.2s linear infinite;
            opacity: 0.15;
          }
          @keyframes spinner-fade {
            0% { opacity: 1; }
            100% { opacity: 0.15; }
          }
        `}</style>
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            className="spinner-bar"
            x="11"
            y="2"
            width="2"
            height="5"
            rx="1"
            fill={color}
            transform={`rotate(${i * 30} 12 12)`}
            style={{
              animationDelay: `${-1.2 + i * 0.1}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default Loader;
