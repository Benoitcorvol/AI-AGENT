import React, { useState, useEffect, useRef } from 'react';
import { Brain, Github, MessageCircle, Layout, Database, Menu, X, LucideIcon } from 'lucide-react';
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
import { Conversation, UserParticipant, AgentParticipant } from './types/chat';
import { agentDb } from './db/agentDb';
import { toolDb } from './db/toolDb';
import { workflowDb } from './db/workflowDb';
import { modelDb } from './db/modelDb';
import { ChatManager } from './services/chatManager';
import { initializeDB, clearDatabase } from './db/dbSetup';

type View = 'chat' | 'dashboard' | 'database';

interface NavButtonProps {
  view: View;
  icon: LucideIcon;
  label: string;
}

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chatManagerRef = useRef<ChatManager | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        
        // Clear and reinitialize the database
        await clearDatabase();
        await initializeDB();
        
        // Load all data after initialization
        const [loadedAgents, loadedWorkflows, loadedTools] = await Promise.all([
          agentDb.getAllAgents(),
          workflowDb.getAllWorkflows(),
          toolDb.getAllTools()
        ]);
        
        setAgents(loadedAgents);
        setWorkflows(loadedWorkflows);
        setTools(loadedTools);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setAgents([]);
        setWorkflows([]);
        setTools([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
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
        const userParticipant: UserParticipant = {
          id: 'user',
          type: 'user',
          name: 'You'
        };

        const managerParticipant: AgentParticipant | undefined = manager ? {
          id: manager.id,
          type: 'agent',
          name: manager.name,
          role: manager.role
        } : undefined;

        const workerParticipants: AgentParticipant[] = workers.map(worker => ({
          id: worker.id,
          type: 'agent',
          name: worker.name,
          role: worker.role
        }));

        const participants = [
          userParticipant,
          ...(managerParticipant ? [managerParticipant] : []),
          ...workerParticipants
        ];

        const newConversation = await chatManagerRef.current!.startConversation(
          selectedWorkflow.id,
          selectedWorkflow.name,
          participants
        );
        setConversation(newConversation);
        setCurrentView('chat');
      };

      startChat();
    }
  }, [selectedWorkflow, agents]);

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

  const handleModelConfigured = async () => {
    // Reload data after model configuration changes
    setIsLoading(true);
    try {
      const [loadedAgents, loadedWorkflows, loadedTools] = await Promise.all([
        agentDb.getAllAgents(),
        workflowDb.getAllWorkflows(),
        toolDb.getAllTools()
      ]);
      setAgents(loadedAgents);
      setWorkflows(loadedWorkflows);
      setTools(loadedTools);
    } catch (error) {
      console.error('Failed to reload data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const NavButton = ({ view, icon: Icon, label }: NavButtonProps) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-[#128C7E] text-white' 
          : 'bg-white/10 hover:bg-white/20'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <header className="bg-[#075E54] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">AI Workflow Chat</h1>
              <p className="text-green-100 text-sm hidden sm:block">Created by Benoit Corvol</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavButton view="chat" icon={MessageCircle} label="Chat" />
            <NavButton view="dashboard" icon={Layout} label="Dashboard" />
            <NavButton view="database" icon={Database} label="Database" />
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 py-2 bg-[#064940] border-t border-white/10">
            <div className="flex flex-col gap-2">
              <NavButton view="chat" icon={MessageCircle} label="Chat" />
              <NavButton view="dashboard" icon={Layout} label="Dashboard" />
              <NavButton view="database" icon={Database} label="Database" />
              <a
                href="https://github.com/benoitcor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'chat' ? (
          <div className="max-w-4xl mx-auto">
            {!selectedWorkflow ? (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Welcome to AI Workflow Chat</h2>
                <p className="text-gray-600 mb-6">Start by selecting or creating a workflow to begin a conversation.</p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#128C7E] text-white rounded-lg hover:bg-[#075E54] transition-colors"
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-8">
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <ModelManager onModelConfigured={handleModelConfigured} />
              </div>
              
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <AgentList
                  agents={agents}
                  isLoading={isLoading}
                  onEditAgent={handleEditAgent}
                  onDeleteAgent={handleDeleteAgent}
                />
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6">
                <ToolList
                  tools={tools}
                  isLoading={isLoading}
                  onEditTool={handleEditTool}
                  onDeleteTool={handleDeleteTool}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-8">
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <WorkflowList
                  agents={agents}
                  workflows={workflows}
                  executions={[]}
                  onEditAgent={handleEditAgent}
                  onSelectWorkflow={setSelectedWorkflow}
                  onDeleteWorkflow={handleDeleteWorkflow}
                  onCreateWorkflow={handleCreateWorkflow}
                />
              </div>

              {selectedWorkflow && (
                <div className="bg-white rounded-lg p-4 sm:p-6">
                  <WorkflowBuilder
                    agents={agents}
                    workflow={selectedWorkflow}
                    onUpdateWorkflow={handleUpdateWorkflow}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
