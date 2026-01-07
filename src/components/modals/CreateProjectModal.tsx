import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { X, Loader2, ArrowRight, ArrowLeft, Calendar, Users, Target, Check, Search } from 'lucide-react';
import api, { API_ROUTES } from '@/utils/api';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrganizationMember {
  id: string; // or _id
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    tags: [] as string[],
    teamMemberIds: [] as string[],
    budget: 0,
    progress: 0
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen) {
        setStep(1); // Reset step
        fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    try {
        const res = await api.get(API_ROUTES.MANAGER.MEMBERS);
        // Handle different response structures if needed (e.g. res.data.data)
        const team = res.data.data || res.data || [];
        setMembers(team);
    } catch (error) {
        console.error("Failed to fetch members", error);
    }
  };

  const handleNext = () => {
      // Validation Step 1
      if (step === 1) {
          if (!formData.name) {
              toast.error("Project name is required");
              return;
          }
           setStep(2);
      }
      // Validation Step 2
      else if (step === 2) {
           if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
               toast.error("End date cannot be before start date");
               return;
           }
           setStep(3);
      }
  };

  const handleBack = () => {
      if (step > 1) setStep(step - 1);
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
    setLoading(true);
    try {
      await api.post(API_ROUTES.PROJECTS.ROOT, formData);
      toast.success('Project created successfully');
      setFormData({ 
          name: '', description: '', startDate: '', endDate: '', 
          status: 'PLANNING', priority: 'MEDIUM', tags: [], teamMemberIds: [],
          budget: 0, progress: 0 
      });
      setStep(1);
      onSuccess();
      onClose();
    } catch (error: any) {
        const message = error.message || "Failed to create project";
        if (message.includes('Limit reached')) {
            toast.error(message, { duration: 5000 }); 
        } else {
            toast.error(message);
        }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter members for Step 3
  const filteredMembers = members.filter(m => 
      m.firstName.toLowerCase().includes(memberSearch.toLowerCase()) || 
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Stepper */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-start mb-6">
            <div>
                 <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                 <p className="text-sm text-gray-500 mt-1">Set up your project in 3 simple steps</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between relative max-w-sm mx-auto">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded"></div>
             <div className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 rounded transition-all duration-300"
                  style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

             {[1, 2, 3].map((num) => (
                 <div key={num} className={`flex flex-col items-center gap-2`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                         step >= num ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-2 border-gray-200 text-gray-400'
                     }`}>
                         {step > num ? <Check className="w-4 h-4" /> : num}
                     </div>
                     <span className={`text-xs font-medium ${step >= num ? 'text-blue-600' : 'text-gray-400'}`}>
                         {num === 1 ? 'Info' : num === 2 ? 'Details' : 'Team'}
                     </span>
                 </div>
             ))}
          </div>
        </div>
        
        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1">
             
             {/* Step 1: Info */}
             {step === 1 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                        <Input
                          label="Project Name"
                          required
                          autoFocus
                          size="lg"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Website Overhaul"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                        <textarea
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="What is this project about?"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm resize-none text-gray-900 placeholder-gray-500 shadow-sm"
                        />
                      </div>
                 </div>
             )}

             {/* Step 2: Info (Timeline & Details) */}
             {step === 2 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Input
                            label="Start Date"
                            type="date"
                            size="lg"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Input
                            label="End Date"
                            type="date"
                            size="lg"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
                             <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900 shadow-sm"
                             >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                             </select>
                          </div>
                          <div>
                             <label className="block text-sm font-semibold text-gray-900 mb-2">Initial Status</label>
                             <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900 shadow-sm"
                             >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                             </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Tags</label>
                          <div className="flex gap-2 mb-3 flex-wrap">
                              {formData.tags.map(tag => (
                                  <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1 group">
                                      {tag}
                                      <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                  </span>
                              ))}
                          </div>
                          <div className="flex gap-2">
                             <Input 
                               type="text" 
                               value={tagInput}
                               size='lg'
                               containerClassName="flex-1"
                               onChange={(e) => setTagInput(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                               placeholder="Type tag & press enter"
                             />
                             <button onClick={addTag} type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors">Add</button>
                          </div>
                      </div>
                 </div>
             )}

             {/* Step 3: Team */}
             {step === 3 && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                     <div className="relative">
                        <Input
                            leftIcon={<Search className="w-4 h-4" />}
                            size='lg'
                            type="text"
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            placeholder="Search team members..." 
                        />
                     </div>
                     <p className="text-sm text-gray-500 font-medium">Select members needed for this project</p>
                     
                     <div className="overflow-y-auto max-h-[300px] space-y-2 pr-1 custom-scrollbar">
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
                                          isSelected ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-300 hover:bg-gray-50'
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
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
            {step > 1 ? (
                <button
                onClick={handleBack}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2"
                >
                <ArrowLeft className="w-4 h-4" /> Back
                </button>
            ) : ( <div></div> )}

            {step < 3 ? (
                <button
                onClick={handleNext}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 hover:translate-x-0.5"
                >
                Next Step <ArrowRight className="w-4 h-4" />
                </button>
            ) : (
                <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
