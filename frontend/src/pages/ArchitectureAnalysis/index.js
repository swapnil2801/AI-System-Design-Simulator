import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiInfo,
  FiDollarSign,
  FiCheckCircle,
} from 'react-icons/fi';

const PIE_COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
  '#14B8A6',
];

export default function ArchitectureAnalysis() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const archRes = await api.getArchitecture(id);
        const arch = archRes.data;

        const payload = {
          architecture_id: id,
          nodes: arch.nodes || [],
          edges: arch.edges || [],
        };

        const [analysisRes, costRes] = await Promise.all([
          api.analyze(payload),
          api.estimateCost(payload),
        ]);

        setAnalysis(analysisRes.data);
        setCostData(costRes.data);
      } catch (err) {
        console.error('Failed to load analysis:', err);
        setError('Failed to load analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const warnings = analysis?.warnings || [];
  const suggestions = analysis?.suggestions || [];
  const totalCost = costData?.total_monthly_cost ?? null;

  // Build pie chart data from cost breakdown
  const costBreakdown = costData?.breakdown || [];
  const pieData = Array.isArray(costBreakdown)
    ? costBreakdown.map((item) => ({
        name: item.name || item.component,
        value: typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0,
      }))
    : Object.entries(costBreakdown).map(([name, cost]) => ({
        name,
        value: typeof cost === 'number' ? cost : parseFloat(cost) || 0,
      }));

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            to={`/builder/${id}`}
            className="flex items-center gap-1.5 text-dark-400 hover:text-white transition-colors text-sm"
          >
            <FiArrowLeft />
            Back to Builder
          </Link>
          <span className="text-dark-700">|</span>
          <h1 className="text-white font-semibold text-lg">Architecture Analysis</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-700/50 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warnings */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-400" />
              Warnings
              {warnings.length > 0 && (
                <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded-full">
                  {warnings.length}
                </span>
              )}
            </h2>

            {warnings.length === 0 ? (
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 text-center">
                <FiCheckCircle className="text-green-400 text-2xl mx-auto mb-2" />
                <p className="text-dark-400">No warnings detected. Your architecture looks good.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {warnings.map((w, i) => (
                  <div
                    key={i}
                    className="bg-yellow-900/10 rounded-xl p-4 border border-yellow-800/30"
                  >
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle className="text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-yellow-200 text-sm">
                          {typeof w === 'string' ? w : w.message || w.description || JSON.stringify(w)}
                        </p>
                        {w.severity && (
                          <span className="inline-block mt-2 text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded">
                            {w.severity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FiInfo className="text-blue-400" />
              Suggestions
              {suggestions.length > 0 && (
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">
                  {suggestions.length}
                </span>
              )}
            </h2>

            {suggestions.length === 0 ? (
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 text-center">
                <FiCheckCircle className="text-green-400 text-2xl mx-auto mb-2" />
                <p className="text-dark-400">No additional suggestions at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="bg-blue-900/10 rounded-xl p-4 border border-blue-800/30"
                  >
                    <div className="flex items-start gap-3">
                      <FiInfo className="text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-blue-200 text-sm">
                        {typeof s === 'string' ? s : s.message || s.description || JSON.stringify(s)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cost Section */}
        <div className="mt-8">
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <FiDollarSign className="text-green-400" />
            Cost Estimation
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Cost Card */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <p className="text-dark-400 text-sm mb-2">Total Monthly Cost</p>
              <p className="text-4xl font-bold text-white">
                ${totalCost !== null ? totalCost.toFixed(2) : '--'}
              </p>
              <p className="text-dark-500 text-xs mt-2">Estimated based on current architecture</p>
            </div>

            {/* Pie Chart */}
            {pieData.length > 0 && (
              <div className="lg:col-span-2 bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h3 className="text-white font-medium text-sm mb-4">Cost Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Cost Breakdown Table */}
          {pieData.length > 0 && (
            <div className="mt-6 bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-white font-medium mb-4">Detailed Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left text-dark-400 py-3 px-4 font-medium">
                        Component
                      </th>
                      <th className="text-right text-dark-400 py-3 px-4 font-medium">
                        Monthly Cost
                      </th>
                      <th className="text-right text-dark-400 py-3 px-4 font-medium">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pieData.map((item, i) => (
                      <tr key={i} className="border-b border-dark-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                              }}
                            />
                            <span className="text-white">{item.name}</span>
                          </div>
                        </td>
                        <td className="text-dark-300 py-3 px-4 text-right">
                          ${item.value.toFixed(2)}
                        </td>
                        <td className="text-dark-400 py-3 px-4 text-right">
                          {totalCost
                            ? ((item.value / totalCost) * 100).toFixed(1)
                            : '--'}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-dark-600">
                      <td className="text-white font-medium py-3 px-4">Total</td>
                      <td className="text-white font-medium py-3 px-4 text-right">
                        ${totalCost !== null ? totalCost.toFixed(2) : '--'}
                      </td>
                      <td className="text-dark-400 py-3 px-4 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
