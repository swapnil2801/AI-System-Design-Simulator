import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../utils/auth';
import * as api from '../../services/api';
import {
  FiPlus,
  FiTrash2,
  FiLogOut,
  FiCpu,
  FiFolder,
  FiClock,
  FiZap,
  FiActivity,
  FiLayout,
  FiDollarSign,
  FiShield,
  FiArrowRight,
  FiTarget,
  FiTrendingUp,
  FiLayers,
  FiBookOpen,
  FiStar,
  FiChevronRight,
  FiGrid,
  FiServer,
  FiDatabase,
  FiGlobe,
  FiBox,
  FiUser,
} from 'react-icons/fi';

/* ──────────────────── Tip data ──────────────────── */
const tips = [
  {
    icon: FiLayers,
    title: 'Start with a Client node',
    text: 'Every architecture begins with a Client. Drag one onto the canvas, then connect downstream services.',
    color: '#3b82f6',
  },
  {
    icon: FiShield,
    title: 'Add a Load Balancer',
    text: 'Place a Load Balancer between your Client and services to distribute traffic and improve reliability.',
    color: '#eab308',
  },
  {
    icon: FiDatabase,
    title: "Don't forget Caching",
    text: 'Adding a Cache layer in front of your Database can reduce latency by up to 10x and save costs.',
    color: '#ef4444',
  },
  {
    icon: FiActivity,
    title: 'Simulate before you ship',
    text: 'Run traffic simulations to find bottlenecks and validate your design handles peak loads.',
    color: '#22c55e',
  },
  {
    icon: FiCpu,
    title: 'Use AI Analysis',
    text: 'Let Azure OpenAI review your architecture for reliability, scalability, and best practice gaps.',
    color: '#a855f7',
  },
  {
    icon: FiDollarSign,
    title: 'Compare cloud costs',
    text: 'Estimate infrastructure costs across AWS, Azure, and GCP to find the best fit for your budget.',
    color: '#10b981',
  },
];

/* ──────────────────── Quick-start templates ──────────────────── */
const templates = [
  {
    icon: FiGlobe,
    name: 'Web Application',
    desc: 'Client → CDN → Load Balancer → Microservices → Database',
    color: '#3b82f6',
    tags: ['Beginner', '5 nodes'],
    nodes: [
      { node_type: 'Client', label: 'Client', position_x: 0, position_y: 150 },
      { node_type: 'CDN', label: 'CDN', position_x: 250, position_y: 150 },
      { node_type: 'Load Balancer', label: 'Load Balancer', position_x: 500, position_y: 150 },
      { node_type: 'Microservice', label: 'App Service', position_x: 750, position_y: 150 },
      { node_type: 'Database', label: 'Database', position_x: 1000, position_y: 150 },
    ],
    edges: [
      { source_node: '0', target_node: '1' },
      { source_node: '1', target_node: '2' },
      { source_node: '2', target_node: '3' },
      { source_node: '3', target_node: '4' },
    ],
  },
  {
    icon: FiServer,
    name: 'Microservice System',
    desc: 'API Gateway → Multiple Services → Message Queue → Database',
    color: '#a855f7',
    tags: ['Intermediate', '8 nodes'],
    nodes: [
      { node_type: 'Client', label: 'Client', position_x: 0, position_y: 200 },
      { node_type: 'API Gateway', label: 'API Gateway', position_x: 250, position_y: 200 },
      { node_type: 'Microservice', label: 'User Service', position_x: 500, position_y: 50 },
      { node_type: 'Microservice', label: 'Order Service', position_x: 500, position_y: 200 },
      { node_type: 'Microservice', label: 'Payment Service', position_x: 500, position_y: 350 },
      { node_type: 'Message Queue', label: 'Message Queue', position_x: 750, position_y: 200 },
      { node_type: 'Database', label: 'Primary DB', position_x: 1000, position_y: 100 },
      { node_type: 'Cache', label: 'Redis Cache', position_x: 1000, position_y: 300 },
    ],
    edges: [
      { source_node: '0', target_node: '1' },
      { source_node: '1', target_node: '2' },
      { source_node: '1', target_node: '3' },
      { source_node: '1', target_node: '4' },
      { source_node: '2', target_node: '5' },
      { source_node: '3', target_node: '5' },
      { source_node: '4', target_node: '5' },
      { source_node: '5', target_node: '6' },
      { source_node: '5', target_node: '7' },
    ],
  },
  {
    icon: FiBox,
    name: 'Event-Driven Pipeline',
    desc: 'Client → API Gateway → Message Queue → Serverless → Storage',
    color: '#f97316',
    tags: ['Advanced', '7 nodes'],
    nodes: [
      { node_type: 'Client', label: 'Client', position_x: 0, position_y: 150 },
      { node_type: 'CDN', label: 'CDN', position_x: 200, position_y: 150 },
      { node_type: 'API Gateway', label: 'API Gateway', position_x: 400, position_y: 150 },
      { node_type: 'Message Queue', label: 'Event Bus', position_x: 600, position_y: 150 },
      { node_type: 'Serverless Function', label: 'Processor', position_x: 800, position_y: 50 },
      { node_type: 'Serverless Function', label: 'Notifier', position_x: 800, position_y: 250 },
      { node_type: 'Storage', label: 'Object Storage', position_x: 1000, position_y: 150 },
    ],
    edges: [
      { source_node: '0', target_node: '1' },
      { source_node: '1', target_node: '2' },
      { source_node: '2', target_node: '3' },
      { source_node: '3', target_node: '4' },
      { source_node: '3', target_node: '5' },
      { source_node: '4', target_node: '6' },
    ],
  },
];

/* ──────────────────── Feature quick-links ──────────────────── */
const capabilities = [
  {
    icon: FiLayout,
    title: 'Visual Builder',
    desc: 'Drag & drop 16 component types onto an interactive canvas with auto-connected edges.',
    color: '#3b82f6',
  },
  {
    icon: FiZap,
    title: 'Traffic Simulation',
    desc: 'Send virtual requests through your architecture and see per-node latency and throughput.',
    color: '#22c55e',
  },
  {
    icon: FiCpu,
    title: 'AI-Powered Analysis',
    desc: 'Get intelligent suggestions on reliability, scalability, and security from Azure OpenAI.',
    color: '#a855f7',
  },
  {
    icon: FiDollarSign,
    title: 'Multi-Cloud Costing',
    desc: 'Instantly compare monthly costs across AWS, Azure, and GCP for your design.',
    color: '#10b981',
  },
];

/* ──────────────────── Rotating tip hook ──────────────────── */
function useRotatingTip() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % tips.length), 8000);
    return () => clearInterval(id);
  }, []);
  return { tip: tips[index], index };
}

/* ══════════════════════════════════════════════════════════════
   Dashboard Component
   ══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [architectures, setArchitectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { tip, index: tipIndex } = useRotatingTip();

  useEffect(() => {
    fetchArchitectures();
  }, []);

  const fetchArchitectures = async () => {
    try {
      const res = await api.getArchitectures();
      setArchitectures(res.data);
    } catch (err) {
      console.error('Failed to fetch architectures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (template) => {
    setCreating(true);
    try {
      const payload = template
        ? { name: template.name, nodes: template.nodes, edges: template.edges }
        : { name: 'Untitled Architecture', nodes: [], edges: [] };
      const res = await api.createArchitecture(payload);
      navigate(`/builder/${res.data.id || res.data._id}`);
    } catch (err) {
      console.error('Failed to create architecture:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this architecture?')) return;

    setDeleting(id);
    try {
      await api.deleteArchitecture(id);
      setArchitectures((prev) => prev.filter((a) => (a.id || a._id) !== id));
    } catch (err) {
      console.error('Failed to delete architecture:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const nodeCount = (arch) => arch.node_count ?? arch.nodes?.length ?? 0;
  const edgeCount = (arch) => arch.edge_count ?? arch.edges?.length ?? 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* ─── Header ─── */}
      <header className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiCpu className="text-primary-500 text-2xl" />
            <span className="text-white font-bold text-xl">SysDesign AI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-dark-400 text-sm">
              Hello, <span className="text-white font-medium">{user?.name || 'User'}</span>
            </span>
            <Link
              to="/profile"
              className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-dark-800"
              title="Edit profile"
            >
              <FiUser />
              <span className="text-sm">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-dark-800"
            >
              <FiLogOut />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ─── Welcome Banner ─── */}
        <section
          className="relative overflow-hidden rounded-2xl border border-dark-700"
          style={{
            background: 'linear-gradient(135deg, #0c1222 0%, #111d35 50%, #162040 100%)',
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
          />
          <div className="relative px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {greeting()}, {user?.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-dark-300 text-lg">
                Design, simulate, and optimize your distributed systems — all in one place.
              </p>
            </div>
            <button
              onClick={() => handleCreate()}
              disabled={creating}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary-900/40 whitespace-nowrap"
            >
              <FiPlus className="text-lg" />
              {creating ? 'Creating...' : 'New Architecture'}
            </button>
          </div>

          {/* Quick stats bar */}
          <div className="border-t border-white/5 px-8 py-4 flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FiGrid className="text-blue-400 text-sm" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg leading-none">{architectures.length}</p>
                <p className="text-dark-400 text-xs">Architectures</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FiBox className="text-green-400 text-sm" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg leading-none">
                  {architectures.reduce((sum, a) => sum + nodeCount(a), 0)}
                </p>
                <p className="text-dark-400 text-xs">Total Nodes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FiTrendingUp className="text-purple-400 text-sm" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg leading-none">
                  {architectures.reduce((sum, a) => sum + edgeCount(a), 0)}
                </p>
                <p className="text-dark-400 text-xs">Total Connections</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Rotating Tip ─── */}
        <section
          className="rounded-xl border px-5 py-4 flex items-center gap-4 transition-all duration-500"
          style={{
            borderColor: `${tip.color}30`,
            background: `linear-gradient(90deg, ${tip.color}08, transparent)`,
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${tip.color}18` }}
          >
            <tip.icon style={{ color: tip.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm">{tip.title}</p>
            <p className="text-dark-400 text-sm truncate">{tip.text}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {tips.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i === tipIndex ? tip.color : '#374151',
                }}
              />
            ))}
          </div>
        </section>

        {/* ─── Platform Capabilities ─── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FiStar className="text-yellow-400" />
            <h2 className="text-white font-semibold text-lg">What You Can Do</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="rounded-xl border border-dark-700 p-5 hover:border-dark-600 transition-all group cursor-default"
                style={{ background: '#0f172a' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon style={{ color }} className="text-lg" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                <p className="text-dark-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Quick-Start Templates ─── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FiBookOpen className="text-blue-400" />
            <h2 className="text-white font-semibold text-lg">Quick-Start Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const { icon: Icon, name, desc, color, tags } = tpl;
              return (
                <button
                  key={name}
                  onClick={() => handleCreate(tpl)}
                  disabled={creating}
                  className="text-left rounded-xl border border-dark-700 p-5 hover:border-dark-500 transition-all group"
                  style={{ background: '#0f172a' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon style={{ color }} />
                    </div>
                    <h3 className="text-white font-semibold text-sm">{name}</h3>
                    <FiChevronRight className="text-dark-500 ml-auto group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-dark-400 text-xs mb-3 leading-relaxed">{desc}</p>
                  <div className="flex gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-dark-600 text-dark-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── My Architectures ─── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FiFolder className="text-primary-400" />
              <h2 className="text-white font-semibold text-lg">My Architectures</h2>
              {architectures.length > 0 && (
                <span className="ml-2 text-xs text-dark-400 bg-dark-800 px-2 py-0.5 rounded-full">
                  {architectures.length}
                </span>
              )}
            </div>
            <button
              onClick={() => handleCreate()}
              disabled={creating}
              className="flex items-center gap-1.5 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
            >
              <FiPlus className="text-sm" />
              New
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : architectures.length === 0 ? (
            /* Empty State */
            <div
              className="text-center py-16 rounded-2xl border border-dashed border-dark-700"
              style={{ background: '#0b1120' }}
            >
              <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                <FiFolder className="text-dark-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No architectures yet
              </h3>
              <p className="text-dark-400 mb-6 max-w-sm mx-auto text-sm">
                Create your first architecture to start designing and simulating
                distributed systems.
              </p>
              <button
                onClick={() => handleCreate()}
                disabled={creating}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                <FiPlus />
                Create Your First Architecture
              </button>
            </div>
          ) : (
            /* Architecture Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {architectures.map((arch) => {
                const id = arch.id || arch._id;
                const nodes = nodeCount(arch);
                const edges = edgeCount(arch);
                return (
                  <Link
                    key={id}
                    to={`/builder/${id}`}
                    className="rounded-xl p-5 border border-dark-700 hover:border-primary-700/50 transition-all group relative overflow-hidden"
                    style={{ background: '#0f172a' }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity pointer-events-none"
                      style={{ background: '#6366f1' }}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-900/30 flex items-center justify-center">
                          <FiCpu className="text-primary-400" />
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, id)}
                          disabled={deleting === id}
                          className="text-dark-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-dark-700 opacity-0 group-hover:opacity-100"
                          title="Delete architecture"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>

                      <h3 className="text-white font-semibold text-lg mb-1 truncate">
                        {arch.name || 'Untitled Architecture'}
                      </h3>

                      {/* Node / Edge badges */}
                      <div className="flex items-center gap-3 mt-3 mb-3">
                        <span className="flex items-center gap-1 text-xs text-dark-400">
                          <FiBox className="text-blue-400" style={{ fontSize: 11 }} />
                          {nodes} node{nodes !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-dark-400">
                          <FiArrowRight className="text-green-400" style={{ fontSize: 11 }} />
                          {edges} connection{edges !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-dark-500 text-xs">
                          <FiClock style={{ fontSize: 12 }} />
                          <span>
                            {formatDate(arch.created_at || arch.createdAt)}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-primary-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Open <FiArrowRight style={{ fontSize: 11 }} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── Workflow Steps ─── */}
        <section
          className="rounded-2xl border border-dark-700 p-8"
          style={{ background: 'linear-gradient(135deg, #0c1222, #0f172a)' }}
        >
          <h2 className="text-white font-semibold text-lg mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: FiLayout, title: 'Design', desc: 'Drag components onto the canvas and connect them.', color: '#3b82f6' },
              { step: '2', icon: FiZap, title: 'Simulate', desc: 'Send traffic through your system to find bottlenecks.', color: '#22c55e' },
              { step: '3', icon: FiTarget, title: 'Analyze', desc: 'Get AI insights on reliability and scalability.', color: '#a855f7' },
              { step: '4', icon: FiDollarSign, title: 'Optimize', desc: 'Compare costs across AWS, Azure, and GCP.', color: '#10b981' },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="text-center">
                <div className="relative mx-auto w-14 h-14 mb-3">
                  <div
                    className="absolute inset-0 rounded-full opacity-20 blur-md"
                    style={{ background: color }}
                  />
                  <div
                    className="relative w-14 h-14 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: color, background: `${color}10` }}
                  >
                    <Icon style={{ color }} className="text-xl" />
                  </div>
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: color }}
                  >
                    {step}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                <p className="text-dark-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
