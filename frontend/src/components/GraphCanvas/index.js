import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
} from 'reactflow';
import {
  FiMonitor,
  FiGlobe,
  FiServer,
  FiShield,
  FiBox,
  FiDatabase,
  FiMail,
  FiHardDrive,
  FiWifi,
  FiSearch,
  FiActivity,
  FiLock,
  FiZap,
  FiPackage,
} from 'react-icons/fi';
import 'reactflow/dist/style.css';

const nodeColors = {
  'Client': '#3b82f6',
  'CDN': '#22c55e',
  'Load Balancer': '#eab308',
  'API Gateway': '#a855f7',
  'Microservice': '#06b6d4',
  'Cache': '#ef4444',
  'Message Queue': '#f97316',
  'Database': '#ec4899',
  'DNS Server': '#14b8a6',
  'Firewall': '#f43f5e',
  'Storage': '#8b5cf6',
  'Search Engine': '#06b6d4',
  'Monitoring': '#10b981',
  'Auth Service': '#f59e0b',
  'Serverless Function': '#6366f1',
  'Container': '#0ea5e9',
};

const nodeIcons = {
  'Client': FiMonitor,
  'CDN': FiGlobe,
  'Load Balancer': FiServer,
  'API Gateway': FiShield,
  'Microservice': FiBox,
  'Cache': FiDatabase,
  'Message Queue': FiMail,
  'Database': FiHardDrive,
  'DNS Server': FiWifi,
  'Firewall': FiShield,
  'Storage': FiHardDrive,
  'Search Engine': FiSearch,
  'Monitoring': FiActivity,
  'Auth Service': FiLock,
  'Serverless Function': FiZap,
  'Container': FiPackage,
};

const SystemNode = ({ data }) => {
  const color = nodeColors[data.nodeType] || '#6b7280';
  const Icon = nodeIcons[data.nodeType] || FiBox;

  const handleDoubleClick = () => {
    console.log('Open config for node:', data.label, data.nodeType);
  };

  return (
    <div
      className="rounded-lg overflow-hidden shadow-lg"
      style={{
        border: `2px solid ${color}`,
        backgroundColor: '#1e1e2e',
        minWidth: 160,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2"
        style={{ backgroundColor: color, borderColor: '#1e1e2e' }}
      />

      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: `${color}30` }}
      >
        <Icon size={14} style={{ color }} />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {data.nodeType}
        </span>
      </div>

      <div className="px-3 py-3">
        <span className="text-white text-sm font-medium">{data.label}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2"
        style={{ backgroundColor: color, borderColor: '#1e1e2e' }}
      />
    </div>
  );
};

const DeletableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [hovered, setHovered] = useState(false);
  const { setEdges } = useReactFlow();

  const onDelete = useCallback(
    (e) => {
      e.stopPropagation();
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    },
    [id, setEdges]
  );

  const visible = hovered || selected;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : style.strokeWidth || 2,
          stroke: selected ? '#ef4444' : style.stroke || '#4b5563',
        }}
      />
      <EdgeLabelRenderer>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="nopan nodrag"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onDelete}
            title="Delete connection"
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#ef4444',
              color: '#fff',
              border: '2px solid #0f172a',
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.5)',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const GraphCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop: externalOnDrop,
  onDragOver: externalOnDragOver,
}) => {
  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(() => ({
    systemNode: SystemNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    deletable: DeletableEdge,
  }), []);

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (externalOnDragOver) externalOnDragOver(event);
    },
    [externalOnDragOver]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow-type');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: 'systemNode',
        position,
        data: { label: label || nodeType, nodeType },
      };

      if (externalOnDrop) externalOnDrop(event, newNode);
    },
    [screenToFlowPosition, externalOnDrop]
  );

  return (
    <div className="flex-1 h-full bg-dark-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        defaultEdgeOptions={{
          type: 'deletable',
          animated: true,
          style: { stroke: '#4b5563' },
        }}
      >
        <Background color="#374151" gap={20} size={1} variant="dots" />
        <Controls
          className="!bg-dark-800 !border-dark-700 !shadow-lg [&>button]:!bg-dark-700 [&>button]:!border-dark-600 [&>button]:!text-gray-300 [&>button:hover]:!bg-dark-600"
        />
        <MiniMap
          nodeColor={(node) => nodeColors[node.data?.nodeType] || '#6b7280'}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-dark-800 !border-dark-700"
        />
      </ReactFlow>
    </div>
  );
};

export { SystemNode, nodeColors, nodeIcons };
export default GraphCanvas;
