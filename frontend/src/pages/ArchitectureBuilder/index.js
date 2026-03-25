import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge } from 'reactflow';
import * as api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import GraphCanvas from '../../components/GraphCanvas';
import SimulationPanel from '../../components/SimulationPanel';
import {
  FiSave,
  FiPlay,
  FiArrowLeft,
  FiZap,
  FiChevronRight,
  FiSidebar,
} from 'react-icons/fi';

function BuilderInner() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [architectureName, setArchitectureName] = useState('Untitled Architecture');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [simulationResults, setSimulationResults] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [costResults, setCostResults] = useState(null);
  const [aiAnalysisResults, setAiAnalysisResults] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSimPanel, setShowSimPanel] = useState(true);
  const [loading, setLoading] = useState(!!id);
  const [simLoading, setSimLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [costLoading, setCostLoading] = useState(false);

  // Load existing architecture
  useEffect(() => {
    if (!id) return;
    const loadArchitecture = async () => {
      try {
        const res = await api.getArchitecture(id);
        const data = res.data;
        setArchitectureName(data.name || 'Untitled Architecture');

        // Convert backend nodes to React Flow nodes
        if (data.nodes) {
          const flowNodes = data.nodes.map((n) => ({
            id: String(n.id),
            type: 'systemNode',
            position: { x: n.position_x || 0, y: n.position_y || 0 },
            data: {
              label: n.label,
              nodeType: n.node_type,
              config: n.configuration_json || {},
            },
          }));
          setNodes(flowNodes);
        }

        // Convert backend edges to React Flow edges
        if (data.edges) {
          const flowEdges = data.edges.map((e) => ({
            id: String(e.id),
            source: String(e.source_node),
            target: String(e.target_node),
            type: 'deletable',
            animated: true,
            style: { stroke: '#4b5563' },
          }));
          setEdges(flowEdges);
        }
      } catch (err) {
        console.error('Failed to load architecture:', err);
      } finally {
        setLoading(false);
      }
    };
    loadArchitecture();
  }, [id, setNodes, setEdges]);

  // Connect two nodes
  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'deletable',
            animated: true,
            style: { stroke: '#4b5563' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Drop a new node from the sidebar
  const onDrop = useCallback(
    (_event, newNode) => {
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Save architecture
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Build ordered node list and a mapping from React Flow ID → index
      const nodeList = nodes.map((n, idx) => ({
        node_type: n.data.nodeType,
        label: n.data.label,
        position_x: n.position.x,
        position_y: n.position.y,
        configuration_json: n.data.config || {},
        _rf_id: n.id, // temporary, used for edge mapping below
      }));

      const rfIdToIndex = {};
      nodes.forEach((n, idx) => {
        rfIdToIndex[n.id] = String(idx);
      });

      const payload = {
        name: architectureName,
        nodes: nodeList.map(({ _rf_id, ...rest }) => rest),
        edges: edges.map((e) => ({
          source_node: rfIdToIndex[e.source] ?? e.source,
          target_node: rfIdToIndex[e.target] ?? e.target,
        })),
      };

      if (id) {
        const res = await api.updateArchitecture(id, payload);
        // Reload with server-assigned IDs so edges stay consistent
        const data = res.data;
        if (data.nodes) {
          const flowNodes = data.nodes.map((n) => ({
            id: String(n.id),
            type: 'systemNode',
            position: { x: n.position_x || 0, y: n.position_y || 0 },
            data: {
              label: n.label,
              nodeType: n.node_type,
              config: n.configuration_json || {},
            },
          }));
          setNodes(flowNodes);
        }
        if (data.edges) {
          const flowEdges = data.edges.map((e) => ({
            id: String(e.id),
            source: String(e.source_node),
            target: String(e.target_node),
            type: 'deletable',
            animated: true,
            style: { stroke: '#4b5563' },
          }));
          setEdges(flowEdges);
        }
      } else {
        const res = await api.createArchitecture(payload);
        navigate(`/builder/${res.data.id}`, { replace: true });
      }
    } catch (err) {
      console.error('Failed to save architecture:', err);
    } finally {
      setSaving(false);
    }
  }, [id, architectureName, nodes, edges, navigate, setNodes, setEdges]);

  // Simulate traffic
  const handleSimulate = useCallback(
    async ({ requestsPerSecond, avgRequestSize, concurrentUsers, readWriteRatio, peakMultiplier, cacheHitRatio, availabilityTarget, sessionDuration }) => {
      if (!id) {
        alert('Please save the architecture first.');
        return;
      }
      setSimLoading(true);
      try {
        const res = await api.simulate({
          architecture_id: parseInt(id),
          requests_per_second: requestsPerSecond,
          average_request_size: avgRequestSize,
          concurrent_users: concurrentUsers,
          read_write_ratio: readWriteRatio,
          peak_multiplier: peakMultiplier,
          cache_hit_ratio: cacheHitRatio,
          availability_target: availabilityTarget,
          session_duration: sessionDuration,
        });
        const data = res.data;
        setSimulationResults({
          latency: data.system_latency,
          maxRps: data.max_supported_rps,
          bottlenecks: data.bottlenecks || [],
          componentLoads: Object.entries(data.component_loads || {}).map(
            ([name, load]) => ({ name, load: Math.round(load) })
          ),
          peakLatency: data.peak_latency,
          concurrentUsers: data.concurrent_users,
          effectiveRps: data.effective_rps,
          readThroughput: data.read_throughput,
          writeThroughput: data.write_throughput,
          cacheOffload: data.cache_offload_pct,
          availabilityEstimate: data.availability_estimate,
          bandwidthMbps: data.bandwidth_mbps,
        });
      } catch (err) {
        console.error('Simulation failed:', err);
      } finally {
        setSimLoading(false);
      }
    },
    [id]
  );

  // Analyze architecture
  const handleAnalyze = useCallback(async () => {
    if (!id) {
      alert('Please save the architecture first.');
      return;
    }
    setAnalysisLoading(true);
    try {
      const res = await api.analyze({ architecture_id: parseInt(id) });
      setAnalysisResults(res.data);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalysisLoading(false);
    }
  }, [id]);

  // AI Analyze
  const handleAIAnalyze = useCallback(async () => {
    if (!id) {
      alert('Please save the architecture first.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.aiAnalyze({ architecture_id: parseInt(id) });
      setAiAnalysisResults(res.data);
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setAiLoading(false);
    }
  }, [id]);

  // Estimate cost
  const handleEstimateCost = useCallback(async (cloudProvider = 'aws') => {
    if (!id) {
      alert('Please save the architecture first.');
      return;
    }
    setCostLoading(true);
    try {
      const res = await api.estimateCost({
        architecture_id: parseInt(id),
        cloud_provider: cloudProvider,
      });
      setCostResults({
        total: res.data.total_monthly_cost,
        cloudProvider: res.data.cloud_provider,
        breakdown: Object.entries(res.data.breakdown || {}).map(
          ([name, cost]) => ({ name, cost })
        ),
        comparison: res.data.comparison || {},
      });
    } catch (err) {
      console.error('Cost estimation failed:', err);
    } finally {
      setCostLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-950 overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-14 border-b border-dark-800 bg-dark-900 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-dark-400 hover:text-white transition-colors text-sm"
          >
            <FiArrowLeft />
            Dashboard
          </button>
          <FiChevronRight className="text-dark-700 text-sm" />
          <input
            type="text"
            value={architectureName}
            onChange={(e) => setArchitectureName(e.target.value)}
            className="bg-transparent border-none text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 rounded px-2 py-1 w-64"
            placeholder="Architecture name"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimPanel((v) => !v)}
            className="flex items-center gap-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <FiSidebar className="text-sm" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <FiSave className="text-sm" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          {id && (
            <>
              <button
                onClick={() => navigate(`/simulation/${id}`)}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <FiPlay className="text-sm" />
                Results
              </button>
              <button
                onClick={() => navigate(`/analysis/${id}`)}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <FiZap className="text-sm" />
                Analysis
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Canvas */}
        <div className="flex-1 relative">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
          />
        </div>

        {/* Right Panel */}
        {showSimPanel && (
          <SimulationPanel
            onSimulate={handleSimulate}
            simulationResults={simulationResults}
            analysisResults={analysisResults}
            onAnalyze={handleAnalyze}
            onAIAnalyze={handleAIAnalyze}
            aiAnalysisResults={aiAnalysisResults}
            onEstimateCost={handleEstimateCost}
            costResults={costResults}
            simLoading={simLoading}
            analysisLoading={analysisLoading}
            aiLoading={aiLoading}
            costLoading={costLoading}
            architectureName={architectureName}
          />
        )}
      </div>
    </div>
  );
}

export default function ArchitectureBuilder() {
  return (
    <ReactFlowProvider>
      <BuilderInner />
    </ReactFlowProvider>
  );
}
