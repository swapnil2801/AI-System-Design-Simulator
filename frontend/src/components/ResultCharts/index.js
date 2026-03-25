import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

const CHART_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#ef4444', // red
  '#f97316', // orange
  '#ec4899', // pink
];

const darkTooltipStyle = {
  backgroundColor: '#1e1e2e',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#e5e7eb',
  fontSize: '12px',
};

const getLoadColor = (load) => {
  if (load > 80) return '#ef4444';
  if (load > 60) return '#eab308';
  return '#22c55e';
};

/**
 * BarChart showing component loads (name vs load%).
 * Green bars for load < 60%, yellow 60-80%, red > 80%.
 * @param {{ data: Array<{ name: string, load: number }> }} props
 */
export const ComponentLoadChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-64 bg-dark-800 rounded-lg p-4">
      <h4 className="text-gray-300 text-sm font-semibold mb-2">Component Load (%)</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={{ stroke: '#374151' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={{ stroke: '#374151' }}
          />
          <Tooltip contentStyle={darkTooltipStyle} />
          <Bar dataKey="load" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getLoadColor(entry.load)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Horizontal BarChart showing latency per component.
 * @param {{ data: Array<{ name: string, latency: number }> }} props
 */
export const LatencyBreakdownChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-64 bg-dark-800 rounded-lg p-4">
      <h4 className="text-gray-300 text-sm font-semibold mb-2">Latency Breakdown (ms)</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={{ stroke: '#374151' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={{ stroke: '#374151' }}
          />
          <Tooltip contentStyle={darkTooltipStyle} />
          <Bar dataKey="latency" fill="#3b82f6" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * PieChart showing cost per component type.
 * @param {{ data: Array<{ name: string, cost: number }> }} props
 */
export const CostBreakdownChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-72 bg-dark-800 rounded-lg p-4">
      <h4 className="text-gray-300 text-sm font-semibold mb-2">Cost Breakdown</h4>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            dataKey="cost"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={{ stroke: '#6b7280' }}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={darkTooltipStyle}
            formatter={(value) => [`$${value}`, 'Cost']}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default {
  ComponentLoadChart,
  LatencyBreakdownChart,
  CostBreakdownChart,
};
