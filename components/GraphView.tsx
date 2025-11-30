
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { IdeaNode } from '../types';

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
  // Use a fixed reasonable width for the SVG canvas, centered in the container
  const width = 800;
  const height = Math.max(600, nodes.length * 180 + 200);

  const layoutNodes = useMemo(() => calculateFlowchartLayout(nodes, width), [nodes, width]);

  return (
    <div className="w-full h-full min-h-[60vh] overflow-auto bg-slate-50 dark:bg-[#0b1120] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner relative flex justify-center">
      
      {/* Technical Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ 
             backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      <svg className="w-full max-w-[800px]" style={{ height: height }} viewBox={`0 0 ${width} ${height}`}>
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
                ${node.type === 'initial' ? 'text-slate-100 dark:text-slate-800' : 
                  node.type === 'user' ? 'text-white dark:text-slate-800' : 
                  'text-indigo-50 dark:text-indigo-900/10'} 
                ${node.type === 'initial' ? 'stroke-slate-300 dark:stroke-slate-700' : 
                  node.type === 'user' ? 'stroke-slate-200 dark:stroke-slate-700' : 
                  'stroke-indigo-200 dark:stroke-indigo-800'}
              `}
              stroke="currentColor"
              strokeWidth="1"
              filter="url(#shadow)"
            />
            
            {/* Title Text */}
            <foreignObject x={node.x - 120} y={node.y - 35} width="240" height="70">
              <div className="h-full flex flex-col justify-center items-start text-left pl-2">
                <div className="text-[10px] uppercase tracking-wider font-bold mb-1 opacity-60 text-slate-900 dark:text-slate-100">
                  Step {i + 1}
                </div>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                  {node.title}
                </div>
              </div>
            </foreignObject>

            {/* Status Indicator / Decorator */}
             <circle 
              cx={node.x + 120} 
              cy={node.y - 30} 
              r="4" 
              className={`${node.type === 'initial' ? 'fill-emerald-500' : 'fill-slate-300 dark:fill-slate-600'}`}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default GraphView;
