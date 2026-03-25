import React, { useEffect, useState } from 'react';
import {
  FiX, FiActivity, FiCpu, FiZap, FiDollarSign,
  FiAlertTriangle, FiCheckCircle, FiShield, FiTrendingUp,
  FiCloud, FiUsers, FiDatabase, FiLayers, FiWifi, FiDownload,
} from 'react-icons/fi';
import { exportAnalysisReport } from '../../utils/exportPdf';

/* ------------------------------------------------------------------ */
/*  Backdrop + animated modal wrapper                                  */
/* ------------------------------------------------------------------ */
const ModalWrapper = ({ open, onClose, children, title, icon: Icon, accentColor = '#3b82f6', wide = false }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl flex flex-col`}
        style={{
          background: 'linear-gradient(135deg, #0f1729 0%, #0c1222 50%, #0a0f1a 100%)',
          borderColor: `${accentColor}30`,
          boxShadow: `0 0 60px ${accentColor}15, 0 25px 50px rgba(0,0,0,0.5)`,
          animation: 'modalIn 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: `${accentColor}20` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}20` }}>
              {Icon && <Icon size={20} style={{ color: accentColor }} />}
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <FiX size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e3a5f #0c1222' }}>
          {children}
        </div>
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: accentColor }} />
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Metric card                                                        */
/* ------------------------------------------------------------------ */
const MetricCard = ({ label, value, unit, color = '#3b82f6', icon: Icon }) => (
  <div
    className="relative overflow-hidden rounded-xl p-4"
    style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)`, border: `1px solid ${color}30` }}
  >
    <div className="flex items-start justify-between">
      <div>
        <span className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold block mb-1">{label}</span>
        <span className="text-white text-2xl font-black">{value}</span>
        {unit && <span className="text-gray-400 text-xs ml-1">{unit}</span>}
      </div>
      {Icon && <Icon size={16} style={{ color }} className="opacity-50" />}
    </div>
    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: color }} />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Tab button                                                         */
/* ------------------------------------------------------------------ */
const TabButton = ({ active, onClick, icon: Icon, label, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      active
        ? 'text-white shadow-lg'
        : 'text-gray-500 hover:text-gray-300 bg-transparent hover:bg-white/5'
    }`}
    style={active ? {
      background: `linear-gradient(135deg, ${color}25, ${color}10)`,
      border: `1px solid ${color}40`,
      boxShadow: `0 0 20px ${color}15`,
    } : { border: '1px solid transparent' }}
  >
    <Icon size={14} />
    {label}
  </button>
);

/* ================================================================== */
/*  UNIFIED ANALYSIS MODAL                                             */
/* ================================================================== */
export const UnifiedAnalysisModal = ({
  open,
  onClose,
  simulationData,
  analysisData,
  aiAnalysisData,
  costData,
  aiLoading = false,
  architectureName = 'Untitled Architecture',
}) => {
  const [activeTab, setActiveTab] = useState('simulation');

  const handleExportPdf = () => {
    exportAnalysisReport({
      architectureName,
      simulationData,
      analysisData,
      aiAnalysisData,
      costData,
    });
  };

  // Auto-switch to the tab that has new data
  useEffect(() => {
    if (aiLoading) setActiveTab('ai');
    else if (aiAnalysisData && !simulationData && !analysisData) setActiveTab('ai');
    else if (analysisData && !simulationData) setActiveTab('analysis');
    else if (costData && !simulationData && !analysisData && !aiAnalysisData) setActiveTab('cost');
  }, [simulationData, analysisData, aiAnalysisData, costData, aiLoading]);

  const tabs = [
    { id: 'simulation', label: 'Performance', icon: FiActivity, color: '#3b82f6', hasData: !!simulationData },
    { id: 'analysis', label: 'Rules', icon: FiCpu, color: '#a855f7', hasData: !!analysisData },
    { id: 'ai', label: 'AI Insights', icon: FiZap, color: '#6366f1', hasData: !!aiAnalysisData || aiLoading },
    { id: 'cost', label: 'Cost', icon: FiDollarSign, color: '#22c55e', hasData: !!costData },
  ];

  const activeColor = tabs.find((t) => t.id === activeTab)?.color || '#3b82f6';

  return (
    <ModalWrapper open={open} onClose={onClose} title="Analysis Report" icon={FiLayers} accentColor={activeColor} wide>
      {/* Tab bar + Export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative">
            <TabButton
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              color={tab.color}
            />
            {tab.hasData && activeTab !== tab.id && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
            )}
          </div>
        ))}
        </div>
        {/* Export PDF button */}
        <button
          onClick={handleExportPdf}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-lg shadow-emerald-500/10"
        >
          <FiDownload size={14} />
          Export PDF
        </button>
      </div>

      {/* ── PERFORMANCE TAB ─────────────────────────────────────── */}
      {activeTab === 'simulation' && (
        <>
          {!simulationData ? (
            <EmptyState text="Run a simulation to see performance metrics" icon={FiActivity} />
          ) : (
            <>
              {/* Primary metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="System Latency" value={simulationData.latency} unit="ms" color="#3b82f6" icon={FiActivity} />
                <MetricCard label="Max Throughput" value={simulationData.maxRps?.toLocaleString()} unit="rps" color="#06b6d4" icon={FiTrendingUp} />
                <MetricCard label="Peak Latency" value={simulationData.peakLatency || '—'} unit="ms" color="#f59e0b" icon={FiZap} />
                <MetricCard label="Bandwidth" value={simulationData.bandwidthMbps || '—'} unit="Mbps" color="#8b5cf6" icon={FiWifi} />
              </div>

              {/* Secondary metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Effective RPS" value={simulationData.effectiveRps?.toLocaleString() || '—'} color="#10b981" icon={FiDatabase} />
                <MetricCard label="Read Throughput" value={simulationData.readThroughput?.toLocaleString() || '—'} unit="rps" color="#06b6d4" />
                <MetricCard label="Write Throughput" value={simulationData.writeThroughput?.toLocaleString() || '—'} unit="rps" color="#f97316" />
                <MetricCard label="Cache Offload" value={`${simulationData.cacheOffload || 0}`} unit="%" color="#22c55e" />
              </div>

              {/* Availability + Concurrent users */}
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Availability Est." value={`${simulationData.availabilityEstimate || '—'}`} unit="%" color="#10b981" icon={FiShield} />
                <MetricCard label="Concurrent Users" value={simulationData.concurrentUsers?.toLocaleString() || '—'} color="#8b5cf6" icon={FiUsers} />
              </div>

              {/* Bottlenecks */}
              {simulationData.bottlenecks?.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiAlertTriangle size={14} className="text-red-400" />
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Bottlenecks Detected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {simulationData.bottlenecks.map((b, i) => (
                      <span key={i} className="bg-red-500/15 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-500/20">{b}</span>
                    ))}
                  </div>
                </div>
              )}

              {simulationData.bottlenecks?.length === 0 && (
                <div className="flex items-center gap-3 rounded-xl p-4 bg-green-500/5 border border-green-500/20">
                  <FiCheckCircle size={18} className="text-green-400" />
                  <span className="text-green-300 text-sm font-medium">No bottlenecks — system looks healthy!</span>
                </div>
              )}

              {/* Component loads */}
              {simulationData.componentLoads?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Component Load</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {simulationData.componentLoads.map((comp, i) => {
                      const isHigh = comp.load > 80;
                      const isMed = comp.load > 60;
                      const barColor = isHigh ? '#ef4444' : isMed ? '#eab308' : '#22c55e';
                      return (
                        <div key={i} className={`rounded-lg p-3 bg-[#111827] border ${isHigh ? 'border-red-500/30' : 'border-[#1e3a5f]'}`}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300 font-medium">{comp.name}</span>
                            <span className={`font-bold ${isHigh ? 'text-red-400' : isMed ? 'text-yellow-400' : 'text-green-400'}`}>{comp.load}%</span>
                          </div>
                          <div className="w-full bg-[#0a0f1a] rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-2.5 rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min(comp.load, 100)}%`,
                                background: `linear-gradient(90deg, ${barColor}90, ${barColor})`,
                                boxShadow: `0 0 12px ${barColor}40`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── RULES TAB ──────────────────────────────────────────── */}
      {activeTab === 'analysis' && (
        <>
          {!analysisData ? (
            <EmptyState text="Run Rule Analysis to see architecture insights" icon={FiCpu} />
          ) : (
            <>
              {analysisData.warnings?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle size={13} className="text-amber-400" />
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Warnings ({analysisData.warnings.length})</span>
                  </div>
                  {analysisData.warnings.map((w, i) => (
                    <div key={i} className="flex gap-3 items-start rounded-xl p-3.5 bg-amber-500/5 border border-amber-500/15">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-amber-400 text-[10px] font-bold">{i + 1}</span>
                      </div>
                      <span className="text-amber-200/90 text-sm leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {analysisData.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle size={13} className="text-blue-400" />
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Suggestions ({analysisData.suggestions.length})</span>
                  </div>
                  {analysisData.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 items-start rounded-xl p-3.5 bg-blue-500/5 border border-blue-500/15">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-blue-400 text-[10px] font-bold">{i + 1}</span>
                      </div>
                      <span className="text-blue-200/90 text-sm leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {(!analysisData.warnings || analysisData.warnings.length === 0) && (!analysisData.suggestions || analysisData.suggestions.length === 0) && (
                <div className="flex items-center gap-3 rounded-xl p-4 bg-green-500/5 border border-green-500/20">
                  <FiCheckCircle size={18} className="text-green-400" />
                  <span className="text-green-300 text-sm font-medium">Architecture looks great — no issues found!</span>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── AI INSIGHTS TAB ────────────────────────────────────── */}
      {activeTab === 'ai' && (
        <>
          {aiLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
                <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                <FiZap size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">Analyzing your architecture...</p>
                <p className="text-gray-500 text-xs mt-1">Azure OpenAI is reviewing your design</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-indigo-500" style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
            </div>
          )}

          {!aiLoading && !aiAnalysisData && (
            <EmptyState text="Run AI Analysis to get intelligent architecture insights" icon={FiZap} />
          )}

          {!aiLoading && aiAnalysisData && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {aiAnalysisData.reliability_score != null && (
                  <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-[#111827] to-[#0c1222] border border-[#1e3a5f]">
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold block mb-2">Reliability Score</span>
                    <div className="flex items-center gap-3">
                      <FiShield size={24} className={
                        aiAnalysisData.reliability_score >= 7 ? 'text-green-400' :
                        aiAnalysisData.reliability_score >= 4 ? 'text-yellow-400' : 'text-red-400'
                      } />
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black ${
                          aiAnalysisData.reliability_score >= 7 ? 'text-green-400' :
                          aiAnalysisData.reliability_score >= 4 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{aiAnalysisData.reliability_score}</span>
                        <span className="text-gray-500 text-lg">/10</span>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-[#0a0f1a] rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full transition-all duration-700" style={{
                        width: `${aiAnalysisData.reliability_score * 10}%`,
                        background: aiAnalysisData.reliability_score >= 7 ? 'linear-gradient(90deg, #22c55e, #4ade80)' :
                          aiAnalysisData.reliability_score >= 4 ? 'linear-gradient(90deg, #eab308, #facc15)' : 'linear-gradient(90deg, #ef4444, #f87171)',
                      }} />
                    </div>
                  </div>
                )}

                {aiAnalysisData.scalability_assessment && (
                  <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-[#111827] to-[#0c1222] border border-[#1e3a5f]">
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold block mb-2">Scalability</span>
                    <div className="flex items-start gap-2">
                      <FiTrendingUp size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-indigo-300 text-sm font-medium leading-relaxed">{aiAnalysisData.scalability_assessment}</span>
                    </div>
                  </div>
                )}
              </div>

              {aiAnalysisData.detailed_analysis && (
                <div className="rounded-xl p-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/15">
                  <span className="text-indigo-400 text-[10px] uppercase tracking-widest font-bold block mb-3">Detailed Analysis</span>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysisData.detailed_analysis}</p>
                </div>
              )}

              {aiAnalysisData.warnings?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Warnings</span>
                  {aiAnalysisData.warnings.map((w, i) => (
                    <div key={i} className="flex gap-3 items-start rounded-xl p-3.5 bg-amber-500/5 border border-amber-500/15">
                      <FiAlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-amber-200/90 text-sm leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {aiAnalysisData.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Suggestions</span>
                  {aiAnalysisData.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 items-start rounded-xl p-3.5 bg-indigo-500/5 border border-indigo-500/15">
                      <FiCheckCircle size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-indigo-200/90 text-sm leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── COST TAB ───────────────────────────────────────────── */}
      {activeTab === 'cost' && (
        <>
          {!costData ? (
            <EmptyState text="Run Cost Estimation to see pricing breakdown" icon={FiDollarSign} />
          ) : (
            <>
              <MetricCard label="Monthly Cost" value={`$${costData.total}`} unit="/mo" color="#22c55e" icon={FiDollarSign} />

              {costData.comparison && Object.keys(costData.comparison).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FiCloud size={13} className="text-gray-500" />
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Cloud Comparison</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(costData.comparison).map(([provider, pData]) => {
                      const isActive = provider === costData.cloudProvider;
                      const cheapest = Object.values(costData.comparison).every((d) => pData.total <= d.total);
                      return (
                        <div
                          key={provider}
                          className={`relative rounded-xl p-4 text-center transition-all ${
                            isActive
                              ? 'bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                              : 'bg-[#111827] border border-[#1e3a5f] hover:border-[#2e4a6f]'
                          }`}
                        >
                          {cheapest && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Best</span>
                          )}
                          <span className={`text-[10px] uppercase tracking-wider font-bold block mb-2 ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>{provider}</span>
                          <span className={`text-xl font-black font-mono block ${isActive ? 'text-white' : 'text-gray-300'}`}>${pData.total}</span>
                          <span className="text-gray-600 text-[10px] block">/month</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {costData.breakdown?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Cost Breakdown</span>
                  <div className="rounded-xl border border-[#1e3a5f] bg-[#111827] overflow-hidden">
                    <div className="grid grid-cols-2 px-4 py-2.5 border-b border-[#1e3a5f] bg-[#0c1222]">
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Component</span>
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider text-right">Cost/mo</span>
                    </div>
                    {costData.breakdown.map((item, i) => (
                      <div key={i} className={`grid grid-cols-2 px-4 py-3 ${i < costData.breakdown.length - 1 ? 'border-b border-[#1e3a5f]/50' : ''} hover:bg-white/[0.02] transition-colors`}>
                        <span className="text-gray-300 text-sm">{item.name}</span>
                        <span className="text-green-400 text-sm font-bold font-mono text-right">${item.cost}</span>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 px-4 py-3 border-t border-[#1e3a5f] bg-green-500/5">
                      <span className="text-white text-sm font-bold">Total</span>
                      <span className="text-green-400 text-sm font-black font-mono text-right">${costData.total}/mo</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </ModalWrapper>
  );
};

/* ------------------------------------------------------------------ */
/*  Empty state placeholder                                            */
/* ------------------------------------------------------------------ */
const EmptyState = ({ text, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
      <Icon size={24} className="text-gray-600" />
    </div>
    <p className="text-gray-600 text-sm text-center max-w-xs">{text}</p>
  </div>
);
