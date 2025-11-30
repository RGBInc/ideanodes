import React, { useState, useRef, useEffect } from 'react';
import { IdeaNode } from '../types';
import { Trash2, Edit2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from '../services/audioService';
import VoiceButton from './VoiceButton';

interface NodeCardProps {
  node: IdeaNode;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newContent: string, newTitle: string) => void;
  isLast: boolean;
}

const DEFAULT_TITLE = 'New Node';
const DEFAULT_CONTENT = 'Describe the next stage of the idea...';

const NodeCard: React.FC<NodeCardProps> = ({ node, index, onDelete, onUpdate, isLast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editContent, setEditContent] = useState(node.content);
  const [expanded, setExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-hide menu after 4 seconds of inactivity (mostly for mobile tap)
  useEffect(() => {
    if (showMenu && !isEditing && !isHovered) {
      const timer = setTimeout(() => setShowMenu(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showMenu, isEditing, isHovered]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking buttons or inputs
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    if (!isEditing) {
      setShowMenu(prev => !prev);
    }
  };

  const startEditing = () => {
    audio.playClick();
    if (node.title === DEFAULT_TITLE) setEditTitle('');
    else setEditTitle(node.title);
    
    if (node.content === DEFAULT_CONTENT) setEditContent('');
    else setEditContent(node.content);
    
    setIsEditing(true);
  };

  const handleSave = async () => {
    let finalTitle = editTitle.trim();
    let finalContent = editContent.trim();

    if (!finalContent) finalContent = DEFAULT_CONTENT;
    if (!finalTitle) finalTitle = DEFAULT_TITLE;

    audio.playClick();
    onUpdate(node.id, finalContent, finalTitle);
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    audio.playClick();
    navigator.clipboard.writeText(`${node.title}\n\n${node.content}`);
  };

  const toggleExpand = () => {
    audio.playHover();
    setExpanded(!expanded);
  }

  const handleVoiceTitle = (text: string) => {
    setEditTitle(prev => {
      const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
      return prev + spacer + text;
    });
  };

  const handleVoiceContent = (text: string) => {
    setEditContent(prev => {
      const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
      return prev + spacer + text;
    });
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-4 mb-2 text-zinc-900 dark:text-white">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-5 mb-2 text-zinc-900 dark:text-white">{line.replace('## ', '')}</h2>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-zinc-600 dark:text-zinc-400">{line.replace('- ', '')}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{line}</p>;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex relative group/card"
    >
      {/* Minimal Index */}
      <div className="flex flex-col items-center mr-4 shrink-0 pt-1">
        <div className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
          {(index + 1).toString().padStart(2, '0')}
        </div>
        {!isLast && (
          <div className="w-px bg-zinc-200 dark:bg-zinc-800 h-full mt-2 mb-2" />
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 mb-6 min-w-0">
        <div 
          className={`
            bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
            rounded-lg p-5 transition-all duration-200
            ${!expanded ? 'overflow-hidden' : ''}
            hover:border-zinc-300 dark:hover:border-zinc-700
          `}
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          
          {/* Unified Header Layout */}
          <div className="flex flex-col mb-2 gap-2">
            <AnimatePresence>
              {(showMenu || isHovered || isEditing) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-end items-center gap-1 pb-2">
                    {isEditing ? (
                      <button onClick={handleSave} className="p-1.5 text-green-600 bg-green-50 dark:bg-green-900/20 rounded">
                        <Check size={16} />
                      </button>
                    ) : (
                      <>
                        <button onClick={copyToClipboard} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors" title="Copy">
                          <Copy size={16} />
                        </button>
                        <button onClick={startEditing} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => onDelete(node.id)} className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                        <button onClick={toggleExpand} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors" title="Expand/Collapse">
                          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="w-full">
              {isEditing ? (
                <div className="flex gap-2 min-w-0 items-center">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Node Title"
                    className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-base font-semibold w-full text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    autoFocus
                  />
                  <VoiceButton onTranscript={handleVoiceTitle} className="shrink-0" />
                </div>
              ) : (
                <h3 className={`text-base font-semibold text-zinc-900 dark:text-white w-full break-words transition-opacity`}>{node.title}</h3>
              )}
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {isEditing ? (
                  <div className="relative mt-2">
                    <textarea
                      ref={textareaRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-3 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-y font-mono text-sm leading-relaxed"
                      placeholder="Describe your idea..."
                    />
                    <div className="absolute bottom-3 right-3">
                      <VoiceButton onTranscript={handleVoiceContent} />
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-none break-words mt-2">
                    {renderContent(node.content)}
                  </div>
                )}
                
                <div className="mt-4 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    {new Date(node.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider
                    ${node.type === 'initial' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' : 
                      node.type === 'user' ? 'text-zinc-400' : 
                      'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200'}`}>
                    {node.type}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default NodeCard;
