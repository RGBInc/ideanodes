import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Sparkles, Layers, Sun, Moon, Volume2, VolumeX, HelpCircle, Network, List, FileInput, StopCircle, LogIn, LogOut, Menu, X, Settings as SettingsIcon, ChevronDown, Trash2, MoreHorizontal, Check, Share, Download, Edit2 } from 'lucide-react';
import { IdeaNode } from './types';
import NodeCard from './components/NodeCard';
import RemixModal from './components/RemixModal';
import ImportModal from './components/ImportModal';
import GraphView from './components/GraphView';
import Tutorial from './components/Tutorial';
import ExportMenu from './components/ExportMenu';
import { Logo } from './components/Logo';
import { audio } from './services/audioService';
import { AuthModal } from './components/Auth';
import { UserMenu } from './components/UserMenu';
import { CookieConsent } from './components/CookieConsent';
import { Terms } from './components/legal/Terms';
import { Privacy } from './components/legal/Privacy';
import { FooterMenu } from './components/FooterMenu';
import { Settings } from './components/Settings';

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "./convex/_generated/api";
import { useWorkflow } from "./hooks/useWorkflow";
import { Id } from "./convex/_generated/dataModel";

const INITIAL_NODE: IdeaNode = {
  id: 'init-1',
  title: 'Start Here',
  content: 'Enter your initial thought or problem statement here to begin the chain of reasoning.',
  type: 'initial',
  createdAt: Date.now()
};

function MainApp() {
  // Auth State
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Convex Data
  const [activeGraphId, setActiveGraphId] = useState<Id<"graphs"> | null>(null);
  const graphs = useQuery(api.nodes.listGraphs);
  const createGraph = useMutation(api.nodes.createGraph);
  const deleteGraph = useMutation(api.nodes.deleteGraph);
  const updateGraphTitle = useMutation(api.nodes.updateGraphTitle);
  const convexNodes = useQuery(api.nodes.getNodes, activeGraphId ? { graphId: activeGraphId } : "skip");
  
  const addNodeMutation = useMutation(api.nodes.addNode);
  const updateNodeMutation = useMutation(api.nodes.updateNode);
  const deleteNodeMutation = useMutation(api.nodes.deleteNode);

  // AI Actions
  const startGenerateNext = useMutation(api.ai.startGenerateNextNode);
  const startRemix = useMutation(api.ai.startRemixBlueprint);
  const startStructure = useMutation(api.ai.startStructureImport);
  const startGenerateTitle = useMutation(api.ai.startGenerateTitle);
  const startGenerateNodeTitle = useMutation(api.ai.startGenerateNodeTitle);

  const [workflowId, setWorkflowId] = useState<Id<"workflows"> | null>(null);
  const workflow = useWorkflow(workflowId);

  // Local State (Fallback)
  const [localNodes, setLocalNodes] = useState<IdeaNode[]>([INITIAL_NODE]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false); 
  const [isSessionMenuOpen, setIsSessionMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<Id<"graphs"> | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState("");

  const isStopped = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sessionMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const sessionButtonRef = useRef<HTMLButtonElement>(null);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Session Menu
      if (isSessionMenuOpen && 
          sessionMenuRef.current && 
          !sessionMenuRef.current.contains(event.target as Node) &&
          sessionButtonRef.current &&
          !sessionButtonRef.current.contains(event.target as Node)) {
        setIsSessionMenuOpen(false);
      }

      // Tools Menu
      if (isToolsMenuOpen && 
          toolsMenuRef.current && 
          !toolsMenuRef.current.contains(event.target as Node) &&
          toolsButtonRef.current &&
          !toolsButtonRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSessionMenuOpen(false);
        setIsToolsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isSessionMenuOpen, isToolsMenuOpen]);

  // Sync Graphs
  useEffect(() => {
    if (isAuthenticated && graphs && graphs.length > 0 && !activeGraphId) {
      setActiveGraphId(graphs[0]._id);
    } else if (isAuthenticated && graphs && graphs.length === 0 && !activeGraphId) {
      createGraph({ title: "New Idea Session" }).then(id => setActiveGraphId(id));
    }
  }, [isAuthenticated, graphs, activeGraphId, createGraph]);

  // Normalize Nodes
  const nodes: IdeaNode[] = isAuthenticated && activeGraphId 
    ? (convexNodes || []).map((n: any) => ({ ...n, id: n._id })) 
    : localNodes;

  // Theme & Audio
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => { audio.toggle(soundEnabled); }, [soundEnabled]);

  useEffect(() => {
    if (viewMode === 'list' && nodes.length > 1) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [nodes.length, viewMode]);

  // Workflow Monitoring
  useEffect(() => {
    if (workflowId && workflow) {
      if (workflow.status === 'completed') {
        setLoading(false);
        setWorkflowId(null);
        audio.playSuccess();
      } else if (workflow.status === 'failed') {
        setLoading(false);
        setWorkflowId(null);
        setError(workflow.error || "Operation failed");
      }
    }
  }, [workflowId, workflow]);

  const startLoading = () => {
    setLoading(true);
    setError(null);
    isStopped.current = false;
  };

  const handleStop = () => {
    isStopped.current = true;
    setLoading(false);
  };

  const addNode = async (title: string, content: string, type: IdeaNode['type'] = 'user') => {
    if (isAuthenticated && activeGraphId) {
      await addNodeMutation({ graphId: activeGraphId, title, content, type });
    } else {
      const newNode: IdeaNode = {
        id: uuidv4(),
        title,
        content,
        type,
        createdAt: Date.now()
      };
      setLocalNodes([...nodes, newNode]);
    }
  };

  const handleGenerateNext = async () => {
    if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
    if (!activeGraphId) return;

    startLoading();
    audio.playGenerate();
    try {
      const id = await startGenerateNext({
        graphId: activeGraphId,
        nodes: nodes.map(n => ({ title: n.title, content: n.content }))
      });
      setWorkflowId(id);
    } catch (err) {
      setLoading(false);
      setError("Failed to start generation.");
    }
  };

  const deleteNode = (id: string) => {
    audio.playDelete();
    if (isAuthenticated) {
      deleteNodeMutation({ id: id as any });
    } else {
      setLocalNodes(nodes.filter(n => n.id !== id));
    }
  };

  const handleManualAdd = () => {
    audio.playClick();
    addNode('New Node', 'Describe the next stage of the idea...', 'user');
  };

  const updateNode = (id: string, newContent: string, newTitle: string) => {
    if (isAuthenticated) {
      updateNodeMutation({ id: id as any, content: newContent, title: newTitle });
      
      // Auto-title node if content is sufficient and title is default
      if ((newTitle === 'New Node' || !newTitle) && newContent.length > 10) {
         startGenerateNodeTitle({ nodeId: id as any, content: newContent });
      }

      // Auto-title Session if this is the first node and session is default
      if (nodes.length > 0 && nodes[0].id === id && activeGraphId) {
        const currentGraph = graphs?.find(g => g._id === activeGraphId);
        if (currentGraph && currentGraph.title === "New Idea Session" && newContent.length > 10) {
           startGenerateTitle({ graphId: activeGraphId, content: newContent });
        }
      }
      
    } else {
      setLocalNodes(nodes.map(n => n.id === id ? { ...n, content: newContent, title: newTitle } : n));
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(nodes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'ideanodes-session.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportMD = () => {
    const mdContent = nodes.map(n => `## ${n.title}\n\n${n.content}\n`).join('\n---\n\n');
    const dataUri = 'data:text/markdown;charset=utf-8,'+ encodeURIComponent(mdContent);
    const exportFileDefaultName = 'ideanodes-session.md';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRemix = async (newTopic: string) => {
    setIsRemixModalOpen(false);
    if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
    
    startLoading();
    audio.playGenerate();
    try {
      // Create a new session for the remix
      const newGraphId = await createGraph({ title: `Remix: ${newTopic}` });
      setActiveGraphId(newGraphId);

      // Start remix in the NEW session, using CURRENT nodes as context
      const id = await startRemix({
        graphId: newGraphId,
        nodes: nodes.map(n => ({ title: n.title, content: n.content })),
        newTopic
      });
      setWorkflowId(id);
    } catch (err) {
      setLoading(false);
      setError("Failed to start remix.");
    }
  };

  const handleImport = async (text: string) => {
    setIsImportModalOpen(false);
    if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
    if (!activeGraphId) return;

    startLoading();
    audio.playGenerate();
    try {
      const id = await startStructure({ graphId: activeGraphId, text });
      setWorkflowId(id);
    } catch (err) {
      setLoading(false);
      setError("Failed to start import.");
    }
  };

  const handleCreateSession = async () => {
    if (!isAuthenticated) { setIsAuthModalOpen(true); return; }
    const id = await createGraph({ title: "New Idea Session" });
    setActiveGraphId(id);
    setIsSessionMenuOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: Id<"graphs">) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteGraph({ graphId: id });
      if (activeGraphId === id) setActiveGraphId(null);
    }
  };

  const startEditingSession = (e: React.MouseEvent, id: Id<"graphs">, currentTitle: string) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditSessionTitle(currentTitle);
  };

  const saveSessionTitle = async (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editingSessionId && editSessionTitle.trim()) {
      await updateGraphTitle({ graphId: editingSessionId, title: editSessionTitle.trim() });
      setEditingSessionId(null);
    }
  };

  return (
    <>
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

      {/* Unified Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 z-40 h-14 flex items-center justify-between px-4 lg:px-8 transition-colors duration-500">
        
        {/* Left: Logo & Session Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <Link to="/" className="shrink-0">
            <Logo className="text-zinc-900 dark:text-white w-8 h-8" />
          </Link>
          
          {/* Session Dropdown (Desktop & Mobile) */}
          <div className="relative">
            <button 
              ref={sessionButtonRef}
              onClick={() => setIsSessionMenuOpen(!isSessionMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-[180px] sm:w-[240px]"
            >
              <span className="text-sm font-bold text-zinc-900 dark:text-white truncate flex-1 text-left">
                {graphs?.find((g: any) => g._id === activeGraphId)?.title || "IdeaNodes"}
              </span>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform shrink-0 ${isSessionMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSessionMenuOpen && (
              <>
                {/* Overlay removed in favor of useClickOutside hook for cleaner interaction */}
                <div ref={sessionMenuRef} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                    <span>Your Sessions</span>
                  </div>

                  <button 
                    onClick={handleCreateSession}
                    className="w-full text-left px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 font-medium"
                  >
                    <Plus size={16} /> New Session
                  </button>

                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                  
                  {graphs?.map((graph: any) => (
                    <div 
                      key={graph._id}
                      onClick={() => { 
                        if (editingSessionId !== graph._id) {
                          setActiveGraphId(graph._id); 
                          setIsSessionMenuOpen(false); 
                        }
                      }}
                      className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors group border-l-2
                        ${activeGraphId === graph._id 
                          ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-medium' 
                          : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                    >
                      {editingSessionId === graph._id ? (
                        <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="text" 
                            value={editSessionTitle}
                            onChange={(e) => setEditSessionTitle(e.target.value)}
                            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            autoFocus
                            onBlur={saveSessionTitle}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveSessionTitle(e); }}
                          />
                          <button onClick={saveSessionTitle} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate flex-1 mr-2">{graph.title}</span>
                          {activeGraphId === graph._id && <Check size={14} className="mr-2 text-zinc-900 dark:text-white shrink-0" />}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => startEditingSession(e, graph._id, graph.title)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteSession(e, graph._id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* View Toggle (Always Visible) */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 mr-1 sm:mr-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('graph')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'graph' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <Network size={16} />
            </button>
          </div>

          {/* Tools Menu (Mobile Only - replaces individual icons) */}
          <div className="md:hidden relative">
            <button 
              ref={toolsButtonRef}
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              <MoreHorizontal size={20} />
            </button>
            
            {isToolsMenuOpen && (
              <>
                {/* Overlay removed in favor of useClickOutside hook */}
                <div ref={toolsMenuRef} className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button onClick={() => { setIsImportModalOpen(true); setIsToolsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <FileInput size={16} /> Import Text
                  </button>
                  <button onClick={() => { handleExportMD(); setIsToolsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <Download size={16} /> Export Markdown
                  </button>
                  <button onClick={() => { setSoundEnabled(!soundEnabled); setIsToolsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} {soundEnabled ? "Mute Sounds" : "Enable Sounds"}
                  </button>
                  <button onClick={() => { setTheme(prev => prev === 'dark' ? 'light' : 'dark'); setIsToolsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? "Light Mode" : "Dark Mode"}
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                  <Link to="/terms" className="block w-full text-left px-4 py-2 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800">Terms & Privacy</Link>
                </div>
              </>
            )}
          </div>

          {/* Desktop Icons (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setIsImportModalOpen(true)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Import">
              <FileInput size={18} />
            </button>
            <ExportMenu onExportJSON={handleExportJSON} onExportMarkdown={handleExportMD} />
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" title={soundEnabled ? "Mute" : "Unmute"}>
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Toggle Theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 sm:mx-2 shrink-0"></div>

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap">
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="pt-20 pb-40 px-4 md:px-8 max-w-3xl mx-auto w-full flex-1 flex flex-col">
        
        {!isAuthenticated && (
          <div className="mb-8 text-center opacity-60 hover:opacity-100 transition-opacity">
             <p className="text-xs text-zinc-500">Sign in to enable AI features & Cloud Sync. Manual sequencing is free.</p>
          </div>
        )}

        <div className="flex-1 relative w-full">
          {viewMode === 'list' ? (
            <div className="space-y-0 w-full">
              {nodes.map((node, index) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  index={index}
                  onDelete={deleteNode}
                  onUpdate={updateNode}
                  isLast={index === nodes.length - 1}
                />
              ))}
              
              {loading && (
                <div className="flex relative animate-pulse mt-4">
                   <div className="flex flex-col items-center mr-4 shrink-0 pt-1">
                     <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-transparent animate-spin" />
                   </div>
                   <div className="flex-1 p-5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                     <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
                     <div className="space-y-2">
                       <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                       <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                     </div>
                   </div>
                </div>
              )}
              
              <div ref={bottomRef} className="h-8" />
            </div>
          ) : (
            <GraphView nodes={nodes} />
          )}
        </div>
      </main>

      <div className="fixed bottom-8 left-0 right-0 z-30 pointer-events-none flex justify-center px-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/50 rounded-full p-1.5 flex items-center gap-1 pointer-events-auto backdrop-blur-xl">
          
          {error && (
             <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
               {error}
             </div>
          )}

          {loading ? (
            <button
              onClick={handleStop}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-sm font-medium transition-all flex items-center gap-2"
            >
              <StopCircle size={16} /> Stop
            </button>
          ) : (
            <>
              <button
                onClick={handleManualAdd}
                className="pl-4 pr-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-full text-sm font-medium transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Node
              </button>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800"></div>

              <button
                onClick={handleGenerateNext}
                className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-sm font-medium transition-all flex items-center gap-2 group"
              >
                <Sparkles size={16} className="text-indigo-500 group-hover:text-indigo-600 transition-colors" /> 
                <span className="hidden sm:inline">Generate</span>
              </button>

              <button
                onClick={() => setIsRemixModalOpen(true)}
                className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-sm font-medium transition-all flex items-center gap-2 group"
              >
                <Layers size={16} className="text-violet-500 group-hover:text-violet-600 transition-colors" /> 
                <span className="hidden sm:inline">Remix</span>
              </button>
            </>
          )}
        </div>
      </div>

      <RemixModal 
        isOpen={isRemixModalOpen} 
        onClose={() => setIsRemixModalOpen(false)}
        onRemix={handleRemix}
        sourceCount={nodes.length}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
      
      <FooterMenu />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-indigo-500/30">
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <CookieConsent />
      </div>
    </Router>
  );
}

export default App;
