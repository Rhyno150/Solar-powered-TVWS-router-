import React from 'react';

interface GaugeProps {
  value: number;
  maxValue: number;
  label?: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, maxValue }) => {
  const percentage = Math.min(Math.max(value / maxValue, 0), 1);
  const angle = percentage * 180;
  
  const getPathColor = (val: number) => {
    if (val < 10) return 'text-accent-orange-dark';
    if (val < 20) return 'text-accent-orange-light';
    return 'text-accent-orange';
  };

  const colorClass = getPathColor(value);

  return (
    <div className="relative w-48 h-24">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Background Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          className="text-gray-300 dark:text-gray-600"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          className={`${colorClass} transition-all duration-500`}
          strokeWidth="10"
          strokeLinecap="round"
          style={{
            strokeDasharray: Math.PI * 40,
            strokeDashoffset: Math.PI * 40 * (1 - percentage),
          }}
        />
      </svg>
      <div className="absolute bottom-0 w-full text-center">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-text-light-secondary dark:text-text-dark-secondary">dB</span>
      </div>
    </div>
  );
};

export default Gauge;