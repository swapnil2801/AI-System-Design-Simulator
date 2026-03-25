import React from 'react';
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

const nodeTypes = [
  { type: 'Client', icon: FiMonitor, color: '#3b82f6' },
  { type: 'CDN', icon: FiGlobe, color: '#22c55e' },
  { type: 'Load Balancer', icon: FiServer, color: '#eab308' },
  { type: 'API Gateway', icon: FiShield, color: '#a855f7' },
  { type: 'Microservice', icon: FiBox, color: '#06b6d4' },
  { type: 'Cache', icon: FiDatabase, color: '#ef4444' },
  { type: 'Message Queue', icon: FiMail, color: '#f97316' },
  { type: 'Database', icon: FiHardDrive, color: '#ec4899' },
  { type: 'DNS Server', icon: FiWifi, color: '#14b8a6' },
  { type: 'Firewall', icon: FiShield, color: '#f43f5e' },
  { type: 'Storage', icon: FiHardDrive, color: '#8b5cf6' },
  { type: 'Search Engine', icon: FiSearch, color: '#06b6d4' },
  { type: 'Monitoring', icon: FiActivity, color: '#10b981' },
  { type: 'Auth Service', icon: FiLock, color: '#f59e0b' },
  { type: 'Serverless Function', icon: FiZap, color: '#6366f1' },
  { type: 'Container', icon: FiPackage, color: '#0ea5e9' },
];

const Sidebar = () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-white text-lg font-semibold">Components</h2>
        <p className="text-gray-400 text-sm mt-1">Drag nodes onto the canvas</p>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {nodeTypes.map(({ type, icon: Icon, color }) => (
          <div
            key={type}
            className="bg-dark-700 hover:bg-dark-600 rounded-lg p-3 cursor-grab flex items-center gap-3 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, type, type)}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <Icon size={18} />
            </div>
            <span className="text-gray-200 text-sm font-medium">{type}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
