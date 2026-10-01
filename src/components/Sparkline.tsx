interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showDots?: boolean;
  labels?: string[];
  showLabels?: boolean;
  referenceLine?: number;
  referenceColor?: string;
}

export function Sparkline({
  data,
  color = '#4F46E5',
  height = 100,
  width = 300,
  showDots = true,
  labels = [],
  showLabels = false,
  referenceLine,
  referenceColor = '#EF4444',
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center text-gray-400 text-sm">
        No data
      </div>
    );
  }

  const padding = { top: 10, right: 10, bottom: showLabels ? 25 : 10, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Add 10% padding to range
  const yMin = min - range * 0.1;
  const yMax = max + range * 0.1;
  const yRange = yMax - yMin;

  const points = data.map((value, index) => {
    const x = padding.left + (data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;
    return { x, y, value };
  });

  // Create SVG path
  const pathD = points.map((point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  // Create area path (for gradient fill)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const gradientId = `gradient-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Reference line */}
      {referenceLine !== undefined && referenceLine >= yMin && referenceLine <= yMax && (
        <line
          x1={padding.left}
          y1={padding.top + chartHeight - ((referenceLine - yMin) / yRange) * chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight - ((referenceLine - yMin) / yRange) * chartHeight}
          stroke={referenceColor}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />
      )}

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {showDots && points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="white"
          stroke={color}
          strokeWidth="2"
        />
      ))}

      {/* Labels */}
      {showLabels && labels.length > 0 && points.map((point, i) => (
        <text
          key={i}
          x={point.x}
          y={height - 5}
          textAnchor="middle"
          fontSize="10"
          fill="#6B7280"
        >
          {labels[i] || ''}
        </text>
      ))}
    </svg>
  );
}

interface DualSparklineProps {
  data1: number[];
  data2: number[];
  color1?: string;
  color2?: string;
  height?: number;
  width?: number;
  labels?: string[];
  showLabels?: boolean;
  legend1?: string;
  legend2?: string;
}

export function DualSparkline({
  data1,
  data2,
  color1 = '#EF4444',
  color2 = '#3B82F6',
  height = 100,
  width = 300,
  labels = [],
  showLabels = false,
  legend1,
  legend2,
}: DualSparklineProps) {
  if ((!data1 || data1.length === 0) && (!data2 || data2.length === 0)) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center text-gray-400 text-sm">
        No data
      </div>
    );
  }

  const allData = [...(data1 || []), ...(data2 || [])];
  const padding = { top: 10, right: 10, bottom: showLabels ? 25 : 10, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const min = Math.min(...allData);
  const max = Math.max(...allData);
  const range = max - min || 1;

  const yMin = min - range * 0.1;
  const yMax = max + range * 0.1;
  const yRange = yMax - yMin;

  const getPoints = (data: number[]) => {
    if (!data || data.length === 0) return [];
    return data.map((value, index) => {
      const x = padding.left + (data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
      const y = padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;
      return { x, y, value };
    });
  };

  const points1 = getPoints(data1);
  const points2 = getPoints(data2);

  const makePath = (points: { x: number; y: number }[]) => {
    return points.map((point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    }).join(' ');
  };

  return (
    <div>
      {(legend1 || legend2) && (
        <div className="flex gap-4 mb-2 justify-center">
          {legend1 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color1 }}></div>
              <span className="text-xs text-gray-600">{legend1}</span>
            </div>
          )}
          {legend2 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color2 }}></div>
              <span className="text-xs text-gray-600">{legend2}</span>
            </div>
          )}
        </div>
      )}
      <svg width={width} height={height} className="overflow-visible">
        {/* Lines */}
        {points1.length > 0 && (
          <path d={makePath(points1)} fill="none" stroke={color1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {points2.length > 0 && (
          <path d={makePath(points2)} fill="none" stroke={color2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Dots */}
        {points1.map((point, i) => (
          <circle key={`p1-${i}`} cx={point.x} cy={point.y} r="3" fill="white" stroke={color1} strokeWidth="2" />
        ))}
        {points2.map((point, i) => (
          <circle key={`p2-${i}`} cx={point.x} cy={point.y} r="3" fill="white" stroke={color2} strokeWidth="2" />
        ))}

        {/* Labels */}
        {showLabels && labels.length > 0 && points1.length > 0 && points1.map((point, i) => (
          <text
            key={i}
            x={point.x}
            y={height - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#6B7280"
          >
            {labels[i] || ''}
          </text>
        ))}
      </svg>
    </div>
  );
}
