import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiArrowLeft,
  FiClock,
  FiZap,
  FiAlertTriangle,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi';

export default function SimulationResults() {
  const { id } = useParams();
  const [simulations, setSimulations] = useState([]);
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [simRes, archRes] = await Promise.all([
          api.getSimulations(id),
          api.getArchitecture(id),
        ]);
        setSimulations(simRes.data);

        // Estimate cost
        const arch = archRes.data;
        if (arch.nodes && arch.nodes.length > 0) {
          try {
            const costRes = await api.estimateCost({
              architecture_id: id,
              nodes: arch.nodes,
              edges: arch.edges || [],
            });
            setCostData(costRes.data);
          } catch (e) {
            console.error('Cost estimation failed:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load simulation data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const latest = simulations.length > 0 ? simulations[0] : null;
  const results = latest?.results || latest || {};

  const avgLatency = results.avg_latency ?? results.latency ?? '--';
  const maxRps = results.max_rps ?? results.throughput ?? '--';
  const bottlenecks = results.bottlenecks || [];
  const componentLoads = results.component_loads || results.component_metrics || [];

  // Transform component loads for chart
  const chartData = Array.isArray(componentLoads)
    ? componentLoads.map((c) => ({
        name: c.name || c.component || c.node_id || 'Unknown',
        load: c.load ?? c.utilization ?? c.cpu_usage ?? 0,
      }))
    : Object.entries(componentLoads).map(([name, value]) => ({
        name,
        load: typeof value === 'object' ? value.load || value.utilization || 0 : value,
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
          <h1 className="text-white font-semibold text-lg">Simulation Results</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!latest ? (
          <div className="text-center py-24">
            <FiActivity className="text-dark-600 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No simulations yet
            </h2>
            <p className="text-dark-400 mb-6">
              Run a simulation from the Architecture Builder to see results here.
            </p>
            <Link
              to={`/builder/${id}`}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg transition-colors"
            >
              Open Builder
            </Link>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                  <FiClock />
                  System Latency
                </div>
                <div className="text-4xl font-bold text-white">
                  {typeof avgLatency === 'number' ? avgLatency.toFixed(1) : avgLatency}
                  <span className="text-lg text-dark-400 ml-1">ms</span>
                </div>
              </div>

              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                  <FiZap />
                  Max Supported RPS
                </div>
                <div className="text-4xl font-bold text-green-400">
                  {typeof maxRps === 'number'
                    ? maxRps.toLocaleString()
                    : maxRps}
                  <span className="text-lg text-dark-400 ml-1">req/s</span>
                </div>
              </div>

              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                  <FiDollarSign />
                  Est. Monthly Cost
                </div>
                <div className="text-4xl font-bold text-blue-400">
                  ${costData?.total_monthly_cost?.toFixed(2) ?? '--'}
                </div>
              </div>
            </div>

            {/* Bottlenecks */}
            {bottlenecks.length > 0 && (
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-8">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <FiAlertTriangle className="text-red-400" />
                  Bottlenecks Detected
                </h2>
                <div className="flex flex-wrap gap-2">
                  {bottlenecks.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-red-900/30 text-red-400 px-3 py-1.5 rounded-lg text-sm border border-red-800/30"
                    >
                      <FiAlertTriangle className="text-xs" />
                      {typeof b === 'string' ? b : b.name || b.component || JSON.stringify(b)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Component Load Chart */}
            {chartData.length > 0 && (
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-8">
                <h2 className="text-white font-semibold text-lg mb-6">
                  Component Load Distribution
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        angle={-35}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        label={{
                          value: 'Load %',
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#9CA3AF',
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="load" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            {costData?.breakdown && (
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <FiDollarSign className="text-blue-400" />
                  Cost Breakdown
                </h2>
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
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(costData.breakdown)
                        ? costData.breakdown
                        : Object.entries(costData.breakdown).map(([name, cost]) => ({
                            name,
                            cost,
                          }))
                      ).map((item, i) => (
                        <tr key={i} className="border-b border-dark-700/50">
                          <td className="text-white py-3 px-4">
                            {item.name || item.component}
                          </td>
                          <td className="text-dark-300 py-3 px-4 text-right">
                            ${typeof item.cost === 'number' ? item.cost.toFixed(2) : item.cost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
