
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { IdeaNode } from '../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GraphViewProps {
  nodes: IdeaNode[];
}

// Calculate layout for a vertical flowchart diagram
const calculateFlowchartLayout = (nodes: IdeaNode[], width: number) => {
  const centerX = width / 2;
  const startY = 80;
  const gapY = 180; // Distance between nodes

  return nodes.map((node, i) => {
    return { 
      ...node, 
      x: centerX, 
      y: startY + (i * gapY) 
    };
  });
};

const GraphView: React.FC<GraphViewProps> = ({ nodes }) => {
  const [scale, setScale] = useState(1);
  
  // Use a fixed reasonable width for the SVG canvas, centered in the container
  const width = 800;
  const height = Math.max(600, nodes.length * 180 + 200);

  const layoutNodes = useMemo(() => calculateFlowchartLayout(nodes, width), [nodes, width]);

  return (
    <div className="w-full h-full min-h-[60vh] bg-slate-50 dark:bg-[#0b1120] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner relative overflow-hidden">
      
      {/* Technical Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ 
             backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`, 
             backgroundSize: '40px 40px',
             transform: `scale(${scale})`,
             transformOrigin: 'center top'
           }}>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 z-20">
        <button 
          onClick={() => setScale(s => Math.min(s + 0.1, 2))}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button 
          onClick={() => setScale(1)}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw size={20} />
        </button>
        <button 
          onClick={() => setScale(s => Math.max(s - 0.1, 0.4))}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
      </div>
      
      <div className="w-full h-full overflow-auto flex justify-center">
        <motion.div 
          style={{ 
            scale,
            transformOrigin: 'center top',
            width: width,
            height: height
          }}
          className="origin-top"
        >
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" className="fill-slate-400 dark:fill-slate-600" />
              </marker>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* Connections (Draw lines first so they are behind nodes) */}
            {layoutNodes.map((node, i) => {
              if (i === 0) return null;
              const prev = layoutNodes[i - 1];
              return (
                <motion.g key={`edge-${i}`}>
                   {/* Vertical Line */}
                  <motion.line
                    x1={prev.x}
                    y1={prev.y + 50} // Bottom of prev card
                    x2={node.x}
                    y2={node.y - 50 - 10} // Top of current card - padding
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                  {/* Arrow tip at the end of the line */}
                  <motion.path
                    d={`M ${node.x} ${node.y - 55} L ${node.x - 5} ${node.y - 65} L ${node.x + 5} ${node.y - 65} Z`}
                    fill="#94a3b8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                  />
                </motion.g>
              );
            })}

            {/* Nodes */}
            {layoutNodes.map((node, i) => (
              <motion.g 
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                {/* Card Body */}
                <rect
                  x={node.x - 140}
                  y={node.y - 50}
                  width="280"
                  height="100"
                  rx="12"
                  fill="currentColor"
                  className={`
                    ${node.type === 'initial' ? 'text-indigo-50 dark:text-indigo-900/30' : 'text-white dark:text-zinc-900'} 
                    stroke-2 ${node.type === 'initial' ? 'stroke-indigo-200 dark:stroke-indigo-800' : 'stroke-slate-200 dark:stroke-slate-700'}
                  `}
                  filter="url(#shadow)"
                />
                
                {/* Header Bar */}
                <rect
                  x={node.x - 140}
                  y={node.y - 50}
                  width="280"
                  height="32"
                  rx="12"
                  className="fill-slate-50/50 dark:fill-white/5"
                />

                {/* Title Text */}
                <foreignObject x={node.x - 120} y={node.y - 42} width="240" height="24">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate text-center font-sans">
                    {node.title}
                  </div>
                </foreignObject>

                {/* Content Preview */}
                <foreignObject x={node.x - 120} y={node.y - 10} width="240" height="50">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-3 text-center leading-relaxed font-sans px-2">
                    {node.content}
                  </div>
                </foreignObject>

                {/* Node Type Badge */}
                <rect
                  x={node.x - 30}
                  y={node.y + 50 - 10}
                  width="60"
                  height="20"
                  rx="10"
                  className="fill-white dark:fill-zinc-800 stroke stroke-slate-200 dark:stroke-slate-700"
                />
                <text
                  x={node.x}
                  y={node.y + 50 + 4}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono uppercase tracking-wider"
                >
                  {node.type}
                </text>
              </motion.g>
            ))}
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default GraphView;
