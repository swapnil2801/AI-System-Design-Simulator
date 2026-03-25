import React, { useState } from 'react';
import {
  FiZap, FiCpu, FiActivity, FiDollarSign,
  FiCheckCircle, FiBarChart2,
} from 'react-icons/fi';
import { UnifiedAnalysisModal } from '../ResultModal';

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */
const Spinner = ({ size = 14, color = 'white' }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 019.8 8" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Pulsing ready dot                                                  */
/* ------------------------------------------------------------------ */
const ReadyDot = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
  </span>
);

/* ------------------------------------------------------------------ */
/*  Config field                                                       */
/* ------------------------------------------------------------------ */
const ConfigField = ({ label, children }) => (
  <div>
    <label className="block text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-[#111827] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all";

/* ------------------------------------------------------------------ */
/*  Main Panel                                                         */
/* ------------------------------------------------------------------ */
const SimulationPanel = ({
  onSimulate,
  simulationResults,
  analysisResults,
  onAnalyze,
  onAIAnalyze,
  aiAnalysisResults,
  onEstimateCost,
  costResults,
  aiLoading = false,
  simLoading = false,
  analysisLoading = false,
  costLoading = false,
  architectureName = 'Untitled Architecture',
}) => {
  // Config state
  const [requestsPerSecond, setRequestsPerSecond] = useState(1000);
  const [avgRequestSize, setAvgRequestSize] = useState(1024);
  const [concurrentUsers, setConcurrentUsers] = useState(100);
  const [readWriteRatio, setReadWriteRatio] = useState(80);
  const [peakMultiplier, setPeakMultiplier] = useState(1);
  const [cacheHitRatio, setCacheHitRatio] = useState(0);
  const [availabilityTarget, setAvailabilityTarget] = useState(99.9);
  const [sessionDuration, setSessionDuration] = useState(300);
  const [cloudProvider, setCloudProvider] = useState('aws');

  // Unified modal
  const [showModal, setShowModal] = useState(false);

  const handleSimulate = () => {
    if (onSimulate) onSimulate({
      requestsPerSecond,
      avgRequestSize,
      concurrentUsers,
      readWriteRatio,
      peakMultiplier,
      cacheHitRatio,
      availabilityTarget,
      sessionDuration,
    });
  };

  const handleAnalyze = () => { if (onAnalyze) onAnalyze(); };

  const handleEstimateCost = () => { if (onEstimateCost) onEstimateCost(cloudProvider); };

  const hasAnyResult = !!(simulationResults || analysisResults || aiAnalysisResults || costResults);

  return (
    <>
      <aside
        className="w-96 bg-gradient-to-b from-[#0c1222] to-[#0a0f1a] border-l border-[#1a2744] flex flex-col h-full overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e3a5f #0c1222' }}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="p-5 border-b border-[#1a2744] bg-gradient-to-r from-blue-900/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <FiActivity size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold tracking-tight">Control Center</h2>
              <p className="text-gray-500 text-xs">Simulate, analyze & estimate</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-5">

          {/* ── Traffic Configuration ────────────────────────────── */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Traffic Configuration</span>
            <div className="grid grid-cols-2 gap-3">
              <ConfigField label="Requests/sec">
                <input type="number" value={requestsPerSecond} onChange={(e) => setRequestsPerSecond(Number(e.target.value))} className={inputCls} />
              </ConfigField>
              <ConfigField label="Req Size (B)">
                <input type="number" value={avgRequestSize} onChange={(e) => setAvgRequestSize(Number(e.target.value))} className={inputCls} />
              </ConfigField>
              <ConfigField label="Concurrent Users">
                <input type="number" value={concurrentUsers} onChange={(e) => setConcurrentUsers(Number(e.target.value))} className={inputCls} />
              </ConfigField>
              <ConfigField label="Peak Multiplier">
                <input type="number" step="0.5" min="1" value={peakMultiplier} onChange={(e) => setPeakMultiplier(Number(e.target.value))} className={inputCls} />
              </ConfigField>
            </div>
          </div>

          {/* ── Behavior Configuration ──────────────────────────── */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Behavior & SLA</span>
            <div className="grid grid-cols-2 gap-3">
              <ConfigField label="Read/Write Ratio">
                <div className="relative">
                  <input type="number" min="0" max="100" value={readWriteRatio} onChange={(e) => setReadWriteRatio(Number(e.target.value))} className={inputCls + ' pr-14'} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-semibold">% read</span>
                </div>
              </ConfigField>
              <ConfigField label="Cache Hit Ratio">
                <div className="relative">
                  <input type="number" min="0" max="100" value={cacheHitRatio} onChange={(e) => setCacheHitRatio(Number(e.target.value))} className={inputCls + ' pr-8'} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-semibold">%</span>
                </div>
              </ConfigField>
              <ConfigField label="SLA Target">
                <div className="relative">
                  <input type="number" step="0.1" min="90" max="99.999" value={availabilityTarget} onChange={(e) => setAvailabilityTarget(Number(e.target.value))} className={inputCls + ' pr-8'} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-semibold">%</span>
                </div>
              </ConfigField>
              <ConfigField label="Session Duration">
                <div className="relative">
                  <input type="number" min="1" value={sessionDuration} onChange={(e) => setSessionDuration(Number(e.target.value))} className={inputCls + ' pr-8'} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-semibold">sec</span>
                </div>
              </ConfigField>
            </div>
          </div>

          {/* ── Action Buttons ──────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSimulate}
              disabled={simLoading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {simLoading ? <Spinner /> : <FiZap size={16} />}
              {simLoading ? 'Simulating...' : 'Run Simulation'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAnalyze}
                disabled={analysisLoading}
                className="relative overflow-hidden bg-[#111827] hover:bg-[#1a2744] disabled:opacity-60 border border-purple-500/30 text-purple-300 hover:text-purple-200 font-semibold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
              >
                {analysisLoading ? <Spinner size={12} color="#c084fc" /> : <FiCpu size={13} />}
                Rule Analysis
              </button>
              {onAIAnalyze && (
                <button
                  onClick={onAIAnalyze}
                  disabled={aiLoading}
                  className="relative overflow-hidden bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 disabled:opacity-60 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-semibold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                >
                  {aiLoading ? <Spinner size={12} color="#818cf8" /> : <FiZap size={13} />}
                  {aiLoading ? 'Analyzing...' : 'AI Analysis'}
                </button>
              )}
            </div>

            {/* Cloud + Cost */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-1.5">Cloud</label>
                <select
                  value={cloudProvider}
                  onChange={(e) => setCloudProvider(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 transition-all"
                >
                  <option value="aws">AWS</option>
                  <option value="azure">Azure</option>
                  <option value="gcp">GCP</option>
                </select>
              </div>
              <button
                onClick={handleEstimateCost}
                disabled={costLoading}
                className="bg-[#111827] hover:bg-[#1a2744] disabled:opacity-60 border border-green-500/30 text-green-300 hover:text-green-200 font-semibold py-2 px-4 rounded-xl transition-all text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                {costLoading ? <Spinner size={12} color="#86efac" /> : <FiDollarSign size={13} />}
                Estimate
              </button>
            </div>
          </div>

          {/* ── View Results Button ─────────────────────────────── */}
          {hasAnyResult && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <FiBarChart2 size={16} />
              View Analysis Report
              <ReadyDot />
            </button>
          )}

          {/* ── Quick result summary cards ──────────────────────── */}
          <div className="space-y-2">
            {simulationResults && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full text-left rounded-xl p-3 bg-[#111827] border border-blue-500/20 hover:border-blue-500/40 hover:bg-[#131d32] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                      <FiActivity size={12} className="text-blue-400" />
                    </div>
                    <div>
                      <span className="text-white text-xs font-semibold block">Performance</span>
                      <span className="text-gray-500 text-[10px]">
                        {simulationResults.latency}ms · {simulationResults.maxRps?.toLocaleString()} rps
                      </span>
                    </div>
                  </div>
                  <FiCheckCircle size={12} className="text-green-400" />
                </div>
              </button>
            )}

            {analysisResults && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full text-left rounded-xl p-3 bg-[#111827] border border-purple-500/20 hover:border-purple-500/40 hover:bg-[#1a1530] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
                      <FiCpu size={12} className="text-purple-400" />
                    </div>
                    <div>
                      <span className="text-white text-xs font-semibold block">Rules</span>
                      <span className="text-gray-500 text-[10px]">
                        {analysisResults.warnings?.length || 0} warnings · {analysisResults.suggestions?.length || 0} tips
                      </span>
                    </div>
                  </div>
                  <FiCheckCircle size={12} className="text-green-400" />
                </div>
              </button>
            )}

            {(aiAnalysisResults || aiLoading) && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full text-left rounded-xl p-3 bg-[#111827] border border-indigo-500/20 hover:border-indigo-500/40 hover:bg-[#151530] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      {aiLoading ? <Spinner size={12} color="#818cf8" /> : <FiZap size={12} className="text-indigo-400" />}
                    </div>
                    <div>
                      <span className="text-white text-xs font-semibold block">AI Insights</span>
                      <span className="text-gray-500 text-[10px]">
                        {aiLoading ? 'Generating...' : `Score: ${aiAnalysisResults?.reliability_score || '-'}/10`}
                      </span>
                    </div>
                  </div>
                  {!aiLoading && <FiCheckCircle size={12} className="text-green-400" />}
                </div>
              </button>
            )}

            {costResults && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full text-left rounded-xl p-3 bg-[#111827] border border-green-500/20 hover:border-green-500/40 hover:bg-[#11211a] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                      <FiDollarSign size={12} className="text-green-400" />
                    </div>
                    <div>
                      <span className="text-white text-xs font-semibold block">Cost</span>
                      <span className="text-gray-500 text-[10px]">${costResults.total}/mo · {costResults.cloudProvider?.toUpperCase()}</span>
                    </div>
                  </div>
                  <FiCheckCircle size={12} className="text-green-400" />
                </div>
              </button>
            )}
          </div>

          <div className="h-4" />
        </div>
      </aside>

      {/* Unified Modal */}
      <UnifiedAnalysisModal
        open={showModal}
        onClose={() => setShowModal(false)}
        simulationData={simulationResults}
        analysisData={analysisResults}
        aiAnalysisData={aiAnalysisResults}
        costData={costResults}
        aiLoading={aiLoading}
        architectureName={architectureName}
      />
    </>
  );
};

export default SimulationPanel;
