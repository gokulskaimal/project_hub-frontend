import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { X, Loader2, Save, Calendar, Users, Target, Check, Search, Tag, Edit2 } from 'lucide-react';
import api, { API_ROUTES } from '@/utils/api';
import toast from 'react-hot-toast';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    priority: string;
    tags?: string[];
    teamMemberIds?: string[];
    progress?: number;
    budget?: number;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project | null;
}

interface OrganizationMember {
  id: string;
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
}

export default function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    tags: [] as string[],
    teamMemberIds: [] as string[],
    budget: 0,
    progress: 0
  });

  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'team'>('details');

  useEffect(() => {
    if (isOpen && project) {
        setFormData({
            name: project.name || '',
            description: project.description || '',
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            status: project.status || 'ACTIVE',
            priority: project.priority || 'MEDIUM',
            tags: project.tags || [],
            teamMemberIds: project.teamMemberIds || [],
            budget: project.budget || 0,
            progress: project.progress || 0
        });
        fetchMembers();
        setActiveTab('details');
    }
  }, [isOpen, project]);

  const fetchMembers = async () => {
    try {
        const res = await api.get(API_ROUTES.MANAGER.MEMBERS);
        const team = res.data.data || res.data || [];
        setMembers(team);
    } catch (error) {
        console.error("Failed to fetch members", error);
    }
  };

  const addTag = () => {
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
          setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
          setTagInput('');
      }
  };

  const removeTag = (tag: string) => {
      setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const toggleMember = (memberId: string) => {
      setFormData(prev => {
          const exists = prev.teamMemberIds.includes(memberId);
          if (exists) {
              return { ...prev, teamMemberIds: prev.teamMemberIds.filter(id => id !== memberId) };
          } else {
              return { ...prev, teamMemberIds: [...prev.teamMemberIds, memberId] };
          }
      });
  };

  const handleSubmit = async () => {
    if (!project) return;
    setLoading(true);
    try {
      await api.put(`${API_ROUTES.PROJECTS.ROOT}/${project.id}`, formData);
      toast.success('Project updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  const filteredMembers = members.filter(m => 
      m.firstName.toLowerCase().includes(memberSearch.toLowerCase()) || 
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <div>
                 <h2 className="text-lg font-bold text-gray-900">Edit Project</h2>
                 <p className="text-xs text-gray-500 mt-0.5">Update project details and settings</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
               <X className="w-5 h-5 text-gray-500" />
             </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Project Details
            </button>
            <button 
                onClick={() => setActiveTab('team')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'team' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Team Members ({formData.teamMemberIds.length})
            </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
             
             {activeTab === 'details' && (
                 <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                      <div>
                        <Input
                          label="PROJECT NAME"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Description</label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm resize-none text-gray-900"
                        />
                      </div>

                       <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Status</label>
                                <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900"
                                >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Priority</label>
                                <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900"
                                >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                label="BUDGET ($)"
                                type="number"
                                min={0}
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Input
                                label="PROGRESS (%)"
                                type="number"
                                min={0}
                                max={100}
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                                />
                            </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                label="START DATE"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                label="END DATE"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                       </div>

                      <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Tags</label>
                          <div className="flex gap-2 mb-2 flex-wrap">
                              {formData.tags.map(tag => (
                                  <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium flex items-center gap-1 group border border-blue-100">
                                      {tag}
                                      <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                  </span>
                              ))}
                          </div>
                          <div className="flex gap-2">
                             <Input 
                               type="text" 
                               value={tagInput}
                               containerClassName="flex-1"
                               onChange={(e) => setTagInput(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                               placeholder="Add a tag..."
                             />
                             <button onClick={addTag} type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors border border-gray-200">Add</button>
                          </div>
                      </div>
                 </div>
             )}

             {activeTab === 'team' && (
                 <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 h-full flex flex-col">
                     <div className="relative">
                        <Input 
                           leftIcon={<Search className="w-4 h-4" />}
                           type="text"
                           value={memberSearch}
                           onChange={(e) => setMemberSearch(e.target.value)}
                           placeholder="Search team members..." 
                        />
                     </div>
                     
                     <div className="overflow-y-auto max-h-[300px] space-y-2 pr-1 custom-scrollbar flex-1">
                         {filteredMembers.length === 0 ? (
                             <div className="text-center py-8 text-gray-400 text-sm">No members found.</div>
                         ) : (
                             filteredMembers.map(member => {
                                 const isSelected = formData.teamMemberIds.includes(member.id || member._id!);
                                 return (
                                    <div 
                                      key={member.id || member._id}
                                      onClick={() => toggleMember(member.id || member._id!)}
                                      className={`group p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                          isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-blue-300 hover:bg-gray-50'
                                      }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {member.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {member.firstName} {member.lastName}
                                                </h4>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                        }`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                 );
                             })
                         )}
                     </div>
                 </div>
             )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end items-center gap-3">
            <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
            Cancel
            </button>
            <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
        </div>
      </div>
    </div>
  );
}
