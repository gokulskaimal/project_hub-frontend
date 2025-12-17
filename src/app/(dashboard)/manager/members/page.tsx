"use client";

import React, { useEffect, useState, useMemo } from "react";
import api, { API_ROUTES } from "@/utils/api";
import { User, Trash2, Ban, CheckCircle, RefreshCw, Mail, Search, ArrowUpDown, Users, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

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
      text: "This will permanently delete the member's account.",
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
    <DashboardLayout title="Team Members">
      <div className="space-y-6">

        {/* Header Actions */}
        <div className="flex justify-end mb-2">
            <button 
                onClick={fetchMembers}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors"
            >
                <RefreshCw size={16} />
                Refresh Data
            </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                 <div>
                     <p className="text-sm text-gray-500">Total Members</p>
                     <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                 </div>
             </div>
             <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
                 <div>
                     <p className="text-sm text-gray-500">Active</p>
                     <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                 </div>
             </div>
             <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Ban size={20} /></div>
                 <div>
                     <p className="text-sm text-gray-500">Inactive</p>
                     <p className="text-xl font-bold text-gray-900">{stats.inactive}</p>
                 </div>
             </div>
        </div>

        {/* Unified Controls Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 bg-white placeholder-gray-500"
                />
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                    <select 
                        value={filterRole} 
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ORG MANAGER">Manager</option>
                        <option value="TEAM MEMBER">Member</option>
                    </select>
                    <Filter className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    <Filter className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

                {/* Sort Buttons */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                     {['name', 'email', 'status'].map((field) => (
                        <button
                            key={field}
                            onClick={() => toggleSort(field)}
                            className={`px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors ${
                                sortBy === field 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            } ${field !== 'status' ? 'border-r border-gray-300' : ''}`}
                        >
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            <ArrowUpDown className="w-3 h-3" />
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Content */}
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => (
                     <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse border border-gray-100"></div>
                 ))}
             </div>
        ) : filteredMembers.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No members found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredMembers.map(member => {
                     const isActive = (member.status || 'ACTIVE') === 'ACTIVE';
                     return (
                         <div key={member.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                                          {member.firstName.charAt(0)}
                                      </div>
                                      <div>
                                          <h3 className="font-semibold text-gray-900 leading-tight">{member.firstName} {member.lastName}</h3>
                                          <p className="text-xs text-gray-500">{member.role === 'ORG MANAGER' ? 'Manager' : 'Team Member'}</p>
                                      </div>
                                 </div>
                                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${
                                      isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                 }`}>
                                      {isActive ? 'ACTIVE' : 'BLOCKED'}
                                 </span>
                             </div>

                             <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg mb-4">
                                  <Mail size={14} className="text-gray-400" />
                                  <span className="truncate">{member.email}</span>
                             </div>

                             <div className="mt-auto pt-4 border-t border-gray-50 grid grid-cols-2 gap-2">
                                  <button 
                                      onClick={() => handleBlockMember(member.id, member.status || 'ACTIVE')}
                                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                                          isActive 
                                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                                      }`}
                                  >
                                      {isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                                      {isActive ? 'Block' : 'Unblock'}
                                  </button>
                                  <button 
                                      onClick={() => handleRemoveMember(member.id)}
                                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"
                                  >
                                      <Trash2 size={14} /> Remove
                                  </button>
                             </div>
                         </div>
                     );
                 })}
             </div>
        )}
      </div>
    </DashboardLayout>
  );
}
