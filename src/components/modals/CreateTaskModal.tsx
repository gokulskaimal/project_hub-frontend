import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api, { API_ROUTES } from '@/utils/api';
import toast from 'react-hot-toast';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}

interface User {
    _id: string; // The backend uses _id for the response from /manager/members or sometimes id? Note: ManagerController usually returns User Document.
    // Actually ManagerController.getAllMembers returns Member[] which is User[]
    // Let's assume the shape is { id: string, name: string, email: string }
    id: string; 
    firstName: string;
    lastName?: string;
    email: string;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess, projectId }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (isOpen) {
        fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
      try {
          const res = await api.get(API_ROUTES.MANAGER.MEMBERS);
          // Backend Response Standard: { success: true, data: [...] }
          // Members data usually comes as `res.data.data`
          setMembers(res.data.data || []);
      } catch (error) {
          console.error("Failed to fetch members", error);
      }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    try {
      // Backend expects /api/projects/:projectId/tasks
      await api.post(`${API_ROUTES.PROJECTS.ROOT}/${projectId}/tasks`, {
        ...formData,
        projectId,
        assignedTo: formData.assignedTo || undefined // Send undefined if empty string
      });
      toast.success('Task created successfully');
      setFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedTo: '' });
      onSuccess();
      onClose();
    } catch (error: any) {
       // handled by interceptor
       const message = error.message || "Failed to create task";
       toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Add New Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Design Homepage"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task details..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900"
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Optional)</label>
            <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900"
            >
                <option value="">Unassigned</option>
                {members.map(member => (
                    <option key={member.id || member._id} value={member.id || member._id}>
                        {member.firstName} {member.lastName} ({member.email})
                    </option>
                ))}
            </select>
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
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
