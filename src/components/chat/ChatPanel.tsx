import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, SplitSquareVertical, Settings } from 'lucide-react';
import { Message, Conversation } from '../../types/chat';
import { Agent } from '../../types/agent';

interface TaskItem {
  description: string;
  assignedTo?: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

interface ChatPanelProps {
  conversation: Conversation | null;
  agents: Agent[];
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ conversation, agents, onSendMessage }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="h-[600px] bg-[#f0f2f5] rounded-lg flex items-center justify-center text-gray-500">
        <p>Select a workflow to start a conversation</p>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getParticipantName = (id: string) => {
    return conversation.participants.find(p => p.id === id)?.name || 'Unknown';
  };

  const getParticipantRole = (id: string) => {
    return conversation.participants.find(p => p.id === id)?.role || '';
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.name} (${agent.role})` : agentId;
  };

  const renderTaskDecomposition = (tasks: TaskItem[]) => {
    return (
      <div className="mt-2 bg-white rounded-lg p-3 text-sm">
        <div className="flex items-center gap-2 text-gray-700 mb-2">
          <SplitSquareVertical className="w-4 h-4" />
          <span className="font-medium">Task Decomposition</span>
        </div>
        <ul className="space-y-2">
          {tasks.map((task: TaskItem, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mt-1">
                <span className="text-xs text-green-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800">{task.description}</p>
                {task.assignedTo && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Assigned to: {getAgentName(task.assignedTo)}
                    </p>
                    {task.status && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Available Agents: {agents.length}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {agents.map(agent => (
              <span 
                key={agent.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                {agent.name} ({agent.role})
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMessage = (message: Message) => {
    const isUser = message.senderType === 'user';
    const sender = getParticipantName(message.senderId);
    const role = getParticipantRole(message.senderId);
    const isManager = role === 'manager';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-[#128C7E] ml-2' : isManager ? 'bg-[#075E54]' : 'bg-gray-600 mr-2'
          }`}>
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
          
          <div className={`max-w-[calc(100%-3rem)]`}>
            <div className="flex items-baseline mb-1">
              <span className={`text-sm font-medium ${isUser ? 'text-right' : ''} text-[#075E54]`}>
                {sender}
              </span>
              {role && (
                <span className="text-xs text-gray-500 ml-2">
                  {role}
                </span>
              )}
            </div>

            <div className={`rounded-lg px-4 py-2 shadow-sm ${
              isUser 
                ? 'bg-[#DCF8C6] text-black' 
                : 'bg-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.metadata?.status && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                  {message.metadata.status === 'thinking' && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Thinking...</span>
                    </>
                  )}
                  {message.metadata.status === 'executing' && (
                    <>
                      <Settings className="w-3 h-3 animate-spin" />
                      <span>Executing task...</span>
                    </>
                  )}
                </div>
              )}

              {message.metadata?.result?.tasks && renderTaskDecomposition(message.metadata.result.tasks)}

              {message.metadata?.result && !message.metadata.result.tasks && (
                <div className="mt-2 text-xs bg-gray-50 rounded p-2">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(message.metadata.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[600px] bg-[#f0f2f5] rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#075E54] text-white">
        <h3 className="text-lg font-semibold">{conversation.title}</h3>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <span>{conversation.participants.length} participants</span>
          <span>•</span>
          <span>{conversation.status}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-[#FCF4CB] text-sm p-3 rounded-lg text-center mb-4">
          Messages in this workflow are first processed by the manager agent, who will analyze and delegate tasks to specialized agents.
        </div>
        {conversation.messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#f0f2f5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) {
              onSendMessage(message);
              setMessage('');
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
                e.preventDefault();
                onSendMessage(message);
                setMessage('');
              }
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-white border-none rounded-lg focus:ring-2 focus:ring-[#128C7E] shadow-sm"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-3 bg-[#128C7E] text-white rounded-full hover:bg-[#075E54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
