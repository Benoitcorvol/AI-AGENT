import React, { useState, useEffect, useRef } from 'react';
import { Brain, Github, MessageCircle, Layout, Database } from 'lucide-react';
import { AgentList } from './components/AgentList';
import { ToolList } from './components/ToolList';
import { WorkflowBuilder } from './components/workflow/WorkflowBuilder';
import { WorkflowList } from './components/workflow/WorkflowList';
import { ChatPanel } from './components/chat/ChatPanel';
import { ModelManager } from './components/ModelManager';
import DatabaseBrowser from './components/DatabaseBrowser';
import { Agent } from './types/agent';
import { Tool } from './types/agent';
import { Workflow } from './types/workflow';
import { Conversation } from './types/chat';
import { agentDb } from './db/agentDb';
import { toolDb } from './db/toolDb';
import { workflowDb } from './db/workflowDb';
import { ChatManager } from './services/chatManager';
import { initializeDB } from './db/dbSetup';

type View = 'chat' | 'dashboard' | 'database';

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('chat');
  const chatManagerRef = useRef<ChatManager | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDB();
        const loadedTools = await toolDb.getAllTools();
        setTools(loadedTools);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };
    
    init();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (agents.length > 0 && !chatManagerRef.current) {
      chatManagerRef.current = new ChatManager(agents);
    }
  }, [agents]);

  useEffect(() => {
    if (selectedWorkflow && chatManagerRef.current) {
      const manager = agents.find(a => a.id === selectedWorkflow.managerId);
      const workers = agents.filter(a => selectedWorkflow.workerIds?.includes(a.id));
      
      const startChat = async () => {
        const newConversation = await chatManagerRef.current!.startConversation(
          selectedWorkflow.id,
          selectedWorkflow.name,
          [
            { id: 'user', type: 'user' as const, name: 'You' },
            ...manager ? [{
              id: manager.id,
              type: 'agent' as const,
              name: manager.name,
              role: 'Manager'
            }] : [],
            ...workers.map(worker => ({
              id: worker.id,
              type: 'agent' as const,
              name: worker.name,
              role: 'Worker'
            }))
          ]
        );
        setConversation(newConversation);
        setCurrentView('chat');
      };

      startChat();
    }
  }, [selectedWorkflow, agents]);

  const loadData = async () => {
    try {
      const [loadedAgents, loadedWorkflows, loadedTools] = await Promise.all([
        agentDb.getAllAgents(),
        workflowDb.getAllWorkflows(),
        toolDb.getAllTools()
      ]);
      setAgents(loadedAgents);
      setWorkflows(loadedWorkflows);
      setTools(loadedTools);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setAgents([]);
      setWorkflows([]);
      setTools([]);
      setIsLoading(false);
    }
  };

  const handleEditAgent = async (agent: Agent) => {
    try {
      await agentDb.updateAgent(agent);
      setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await agentDb.deleteAgent(id);
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleEditTool = async (tool: Tool) => {
    try {
      await toolDb.updateTool(tool);
      setTools(prev => prev.map(t => t.id === tool.id ? tool : t));
    } catch (error) {
      console.error('Failed to update tool:', error);
    }
  };

  const handleDeleteTool = async (id: string) => {
    try {
      await toolDb.deleteTool(id);
      setTools(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete tool:', error);
    }
  };

  const handleCreateWorkflow = async (workflow: Workflow) => {
    try {
      const newWorkflow = await workflowDb.createWorkflow(workflow);
      setWorkflows(prev => [...prev, newWorkflow]);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleUpdateWorkflow = async (workflow: Workflow) => {
    try {
      await workflowDb.updateWorkflow(workflow);
      setWorkflows(prev => prev.map(w => w.id === workflow.id ? workflow : w));
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await workflowDb.deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
      if (selectedWorkflow?.id === id) {
        setSelectedWorkflow(null);
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!conversation || !chatManagerRef.current) return;
    
    await chatManagerRef.current.sendMessage(conversation.id, content, 'user');
    setConversation(chatManagerRef.current.getConversation(conversation.id));
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <header className="bg-[#075E54] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">AI Workflow Chat</h1>
              <p className="text-green-100 text-sm">Created by Benoit Corvol</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'chat' 
                  ? 'bg-[#128C7E] text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-[#128C7E] text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Layout className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('database')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'database' 
                  ? 'bg-[#128C7E] text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Database className="w-5 h-5" />
              <span>Database</span>
            </button>
            <a
              href="https://github.com/benoitcor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'chat' ? (
          <div className="max-w-4xl mx-auto">
            {!selectedWorkflow ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to AI Workflow Chat</h2>
                <p className="text-gray-600 mb-6">Start by selecting or creating a workflow to begin a conversation.</p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#128C7E] text-white rounded-lg hover:bg-[#075E54] transition-colors"
                >
                  <Layout className="w-5 h-5" />
                  <span>Go to Dashboard</span>
                </button>
              </div>
            ) : (
              <ChatPanel
                conversation={conversation}
                agents={agents}
                onSendMessage={handleSendMessage}
              />
            )}
          </div>
        ) : currentView === 'database' ? (
          <DatabaseBrowser />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              <ModelManager onModelConfigured={() => {}} />
              
              <AgentList
                agents={agents}
                isLoading={isLoading}
                onEditAgent={handleEditAgent}
                onDeleteAgent={handleDeleteAgent}
              />

              <ToolList
                tools={tools}
                isLoading={isLoading}
                onEditTool={handleEditTool}
                onDeleteTool={handleDeleteTool}
              />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-8">
              <WorkflowList
                agents={agents}
                workflows={workflows}
                executions={[]}
                onEditAgent={handleEditAgent}
                onSelectWorkflow={setSelectedWorkflow}
                onDeleteWorkflow={handleDeleteWorkflow}
                onCreateWorkflow={handleCreateWorkflow}
              />

              {selectedWorkflow && (
                <WorkflowBuilder
                  agents={agents}
                  workflow={selectedWorkflow}
                  onUpdateWorkflow={handleUpdateWorkflow}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
