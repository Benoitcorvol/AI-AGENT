import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Tag, Calendar, Users, AlertCircle } from 'lucide-react';
import { Agent } from '../../types/agent';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowFormData) => void;
  agents: Agent[];
}

interface WorkflowFormData {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assigneeId: string;
  status: 'draft' | 'active' | 'on-hold';
  tags: string[];
  attachments: File[];
  templateId?: string;
  dependencies: string[];
}

const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function WorkflowModal({ isOpen, onClose, onSubmit, agents }: WorkflowModalProps) {
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: '',
    status: 'draft',
    tags: [],
    attachments: [],
    dependencies: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof WorkflowFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      nameInputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WorkflowFormData, string>> = {};

    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = 'Due date must be in the future';
      }
    }

    formData.attachments.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        newErrors.attachments = 'One or more files exceed 10MB limit';
      }
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        newErrors.attachments = 'Invalid file type';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workflow-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 id="workflow-title" className="text-xl font-semibold text-gray-900">
            Create New Workflow
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Workflow Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.name ? 'border-red-500' : ''
              }`}
              maxLength={100}
              required
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              maxLength={500}
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className={`block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.dueDate ? 'border-red-500' : ''
                  }`}
                  aria-invalid={errors.dueDate ? 'true' : 'false'}
                  aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
                />
              </div>
              {errors.dueDate && (
                <p id="dueDate-error" className="mt-1 text-sm text-red-600">
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Assignee and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
                Assignee
              </label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="assignee"
                  value={formData.assigneeId}
                  onChange={e => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select assignee</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Attachments</label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
                errors.attachments ? 'border-red-500' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept={ALLOWED_FILE_TYPES.join(',')}
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, XLS, XLSX up to 10MB
                </p>
              </div>
            </div>
            {errors.attachments && (
              <p className="mt-1 text-sm text-red-600">{errors.attachments}</p>
            )}
            {formData.attachments.length > 0 && (
              <ul className="mt-2 space-y-1">
                {formData.attachments.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{errors.submit}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Workflow'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}