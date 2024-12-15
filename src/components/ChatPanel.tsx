import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Wrench } from 'lucide-react';
import { Message, Conversation } from '../types/chat';
import { Agent } from '../types/agent';

interface ChatPanelProps {
  conversation: Conversation | null;
  agents: Agent[];
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ conversation, agents, onSendMessage }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="h-[600px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500">
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

  const renderMessage = (message: Message) => {
    const isUser = message.senderType === 'user';
    const sender = getParticipantName(message.senderId);
    const role = getParticipantRole(message.senderId);

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-indigo-600 ml-2' : 'bg-gray-600 mr-2'
          }`}>
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
          
          <div>
            <div className="flex items-baseline mb-1">
              <span className={`text-sm font-medium ${isUser ? 'text-right' : ''}`}>
                {sender}
              </span>
              {role && (
                <span className="text-xs text-gray-500 ml-2">
                  {role}
                </span>
              )}
            </div>

            <div className={`rounded-lg px-4 py-2 ${
              isUser 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white border border-gray-200'
            }`}>
              <p className="text-sm">{message.content}</p>
              
              {message.metadata?.status && (
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {message.metadata.status === 'thinking' && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Thinking...</span>
                    </>
                  )}
                  {message.metadata.status === 'executing' && (
                    <>
                      <Wrench className="w-3 h-3" />
                      <span>Executing task...</span>
                    </>
                  )}
                </div>
              )}

              {message.metadata?.result && (
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
    <div className="h-[600px] bg-gray-50 rounded-lg border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <h3 className="text-lg font-semibold">{conversation.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{conversation.participants.length} participants</span>
          <span>•</span>
          <span>{conversation.status}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {conversation.messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}