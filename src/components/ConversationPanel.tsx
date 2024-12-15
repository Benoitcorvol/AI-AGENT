import React from 'react';
import { Send, User, Bot, Info } from 'lucide-react';
import { Conversation, ConversationMessage } from '../types/workflow';

interface ConversationPanelProps {
  conversation: Conversation | null;
  onSendMessage: (message: string) => void;
}

export function ConversationPanel({ conversation, onSendMessage }: ConversationPanelProps) {
  const [message, setMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Select a workflow to start a conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                {msg.role === 'system' ? (
                  <Info className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Bot className="w-4 h-4 text-indigo-600" />
                )}
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              {msg.metadata && (
                <div className="mt-1 text-xs opacity-75">
                  {msg.metadata.stepId && <span>Step: {msg.metadata.stepId}</span>}
                  {msg.metadata.toolId && <span> • Tool: {msg.metadata.toolId}</span>}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) {
              onSendMessage(message);
              setMessage('');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}