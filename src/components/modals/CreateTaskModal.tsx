import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api, { API_ROUTES } from '@/utils/api';
import toast from 'react-hot-toast';
import { PRIORITY_LEVELS } from '@/utils/constants';
import { z } from 'zod';

// Zod Schema
// Zod Schema
const taskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
});

// [NEW] Add Task interface (or import it if available)
interface Task {
    id: string;
    title: string;
    description?: string;
    priority: string;
    dueDate?: string;
    assignedTo?: string; // ID of assigned user
    status?: string;
}

interface Member {
    id: string; // adapted from backend _id or id
    _id?: string;
    firstName: string;
    lastName?: string;
    email: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  task?: Task | null;
  projectMembers: Member[]; // [NEW] Accept filtered members from parent
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess, projectId, task, projectMembers }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: PRIORITY_LEVELS.MEDIUM as string,
    dueDate: '',
    assignedTo: ''
  });

  const isEditing = !!task;

  useEffect(() => {
    if (isOpen) {
        setFormErrors({});
        // [UPDATED] Populate form
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                priority: task.priority || PRIORITY_LEVELS.MEDIUM,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                assignedTo: task.assignedTo || ''
            });
        } else {
             setFormData({ title: '', description: '', priority: PRIORITY_LEVELS.MEDIUM, dueDate: '', assignedTo: '' });
        }
    }
  }, [isOpen, task]);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate using Zod
    const result = taskSchema.safeParse(formData);
    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
            if (err.path[0]) {
                errors[err.path[0] as string] = err.message;
            }
        });
        setFormErrors(errors);
        return;
    }

    setLoading(true);
    try {
      if (isEditing && task) {
          // [UPDATED] Update Logic
          await api.put(`${API_ROUTES.PROJECTS.TASKS}/${task.id}`, {
              ...formData,
              priority: formData.priority,
              assignedTo: formData.assignedTo || undefined
          });
          toast.success('Task updated successfully');
      } else {
          // Create Logic
          await api.post(`${API_ROUTES.PROJECTS.ROOT}/${projectId}/tasks`, {
            ...formData,
            projectId,
            assignedTo: formData.assignedTo || undefined
          });
          toast.success('Task created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
       const message = error.message || "Failed to save task";
       toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Input
              label="Task Title"
              required // Keep HTML required for basic UX, Zod for robust check
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Design Homepage"
              error={formErrors.title}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task details..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm resize-none text-gray-900 placeholder-gray-500 shadow-sm"
            />
            {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900 shadow-sm"
                >
                    {Object.values(PRIORITY_LEVELS).map(level => (
                        <option key={level} value={level}>{level.charAt(0) + level.slice(1).toLowerCase()}</option>
                    ))}
                </select>
                {formErrors.priority && <p className="text-xs text-red-500 mt-1">{formErrors.priority}</p>}
            </div>
            <div>
                <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                error={formErrors.dueDate}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Optional)</label>
            <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900 shadow-sm"
            >
                <option value="">Unassigned</option>
                {projectMembers.map(member => (
                    <option key={member.id || member._id} value={member.id || member._id}>
                        {member.firstName} {member.lastName} ({member.email})
                    </option>
                ))}
            </select>
            {formErrors.assignedTo && <p className="text-xs text-red-500 mt-1">{formErrors.assignedTo}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
