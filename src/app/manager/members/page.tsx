"use client";

import React, { useEffect, useState, useMemo } from "react";
import api, { API_ROUTES } from "@/utils/api";
import { User, Trash2, Ban, CheckCircle, RefreshCw, Mail, Search, ArrowUpDown, Users } from "lucide-react";
// import UserModal from "@/components/modals/UserModal";
// import { useMemberProfile } from "@/hooks/useMemberProfile";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  orgId?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filter, Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("email");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // For UserModal (Future integration)
  // const [selectedMember, setSelectedMember] = useState<any>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const profileHook = useMemberProfile();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ROUTES.MANAGER.MEMBERS);
      setMembers(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch members", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Derived Data
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(m => 
        m.email.toLowerCase().includes(lowerTerm) ||
        (m.firstName && m.firstName.toLowerCase().includes(lowerTerm)) ||
        (m.lastName && m.lastName.toLowerCase().includes(lowerTerm))
      );
    }

    // Filter
    if (filterRole !== "ALL") {
      result = result.filter(m => m.role === filterRole);
    }
    if (filterStatus !== "ALL") {
      // Assuming status might be missing for some, default to ACTIVE
      result = result.filter(m => (m.status || 'ACTIVE') === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let valA = "";
      let valB = "";

      if (sortBy === "email") {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortBy === "role") {
        valA = a.role || "";
        valB = b.role || "";
      } else if (sortBy === "status") {
        valA = a.status || "ACTIVE";
        valB = b.status || "ACTIVE";
      } else if (sortBy === "name") {
        valA = (a.firstName || "").toLowerCase();
        valB = (b.firstName || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [members, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => (m.status || 'ACTIVE') === 'ACTIVE').length;
    const inactive = members.filter(m => (m.status || 'ACTIVE') !== 'ACTIVE').length;
    return { total, active, inactive };
  }, [members]);

  const handleRemoveMember = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the member's account. You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    try {
        await api.delete(`${API_ROUTES.MANAGER.MEMBERS}/${id}`); 
      
        toast.success('Member deleted successfully');
        fetchMembers();
    } catch (error) {
        console.error(error);
        toast.error("Failed to remove member");
    }
  };

  const handleBlockMember = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const action = currentStatus === 'ACTIVE' ? 'block' : 'unblock';
    
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this member?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentStatus === 'ACTIVE' ? "#d33" : "#10B981",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, ${action}!`
    });

    if (!result.isConfirmed) return;
    
    try {
        await api.put(`${API_ROUTES.MANAGER.MEMBERS}/${id}/status`, { status: newStatus });
        
        // Optimistic update for now since we don't have the real endpoint connected
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        
        Swal.fire({
          title: action === 'block' ? "Blocked!" : "Unblocked!",
          text: `Member has been ${action}ed.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
    } catch (error) {
        console.error(error);
        toast.error(`Failed to ${action} member`);
    }
  };

  return (
    <div className="p-8 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your team and their roles</p>
        </div>
        <button 
          onClick={fetchMembers} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Members</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Members</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Ban size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.inactive}</h3>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white placeholder-gray-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="ORG_MANAGER">Manager</option>
            <option value="MEMBER">Member</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Sort Toggles */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleSort("name")}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${sortBy === "name" ? "bg-blue-50 text-blue-700 font-medium" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Name <ArrowUpDown size={14} />
            </button>
            <div className="w-px bg-gray-300"></div>
            <button 
              onClick={() => toggleSort("email")}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${sortBy === "email" ? "bg-blue-50 text-blue-700 font-medium" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Email <ArrowUpDown size={14} />
            </button>
            <div className="w-px bg-gray-300"></div>
            <button 
              onClick={() => toggleSort("role")}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${sortBy === "role" ? "bg-blue-50 text-blue-700 font-medium" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Role <ArrowUpDown size={14} />
            </button>
            <div className="w-px bg-gray-300"></div>
            <button 
              onClick={() => toggleSort("status")}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${sortBy === "status" ? "bg-blue-50 text-blue-700 font-medium" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Status <ArrowUpDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-600">
              No members found matching your criteria.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isActive = (member.status || 'ACTIVE') === 'ACTIVE';

              return (
                <div key={member.id || member.email} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isActive ? <CheckCircle size={12} /> : <Ban size={12} />}
                      {(member.status || 'ACTIVE').toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 truncate" title={member.email}>
                      {member.firstName} {member.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail size={14} />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Role: {member.role}</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleBlockMember(member.id, member.status || 'ACTIVE')} 
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive 
                          ? 'text-orange-700 bg-orange-50 hover:bg-orange-100' 
                          : 'text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                      {isActive ? 'Block' : 'Unblock'}
                    </button>
                    <button 
                      onClick={() => handleRemoveMember(member.id)} 
                      className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
