import React from 'react';

interface LineChartProps {
  data: { hour: number; snr: number }[];
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, color = '#F97316' }) => {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 bg-theme-light-gray dark:bg-theme-dark-purple rounded-lg">
        <p className="text-text-light-secondary dark:text-text-dark-secondary">Not enough data for chart.</p>
      </div>
    );
  }

  const width = 500;
  const height = 150;
  const padding = 20;

  const maxSnr = Math.max(...data.map(d => d.snr)) + 5;
  const minSnr = Math.min(...data.map(d => d.snr)) - 5;

  const points = data
    .map((point, i) => {
      const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((point.snr - minSnr) / (maxSnr - minSnr)) * (height - 2 * padding);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className="w-full bg-theme-white dark:bg-theme-dark-purple p-2 rounded-lg">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
            {/* Y-Axis labels */}
            <text x={padding - 5} y={padding + 5} textAnchor="end" className="text-xs fill-current text-text-light-secondary dark:text-text-dark-secondary">{Math.floor(maxSnr - 5)} dB</text>
            <text x={padding - 5} y={height - padding} textAnchor="end" className="text-xs fill-current text-text-light-secondary dark:text-text-dark-secondary">{Math.ceil(minSnr + 5)} dB</text>
            {/* X-Axis labels */}
            <text x={padding} y={height - 5} textAnchor="start" className="text-xs fill-current text-text-light-secondary dark:text-text-dark-secondary">24h ago</text>
            <text x={width - padding} y={height - 5} textAnchor="end" className="text-xs fill-current text-text-light-secondary dark:text-text-dark-secondary">Now</text>
        </svg>
    </div>
  );
};

export default LineChart;