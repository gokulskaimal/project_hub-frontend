"use client";

import React, { useEffect, useState, useMemo } from "react";
import api, { API_ROUTES } from "@/utils/api";
import { Mail, Trash2, RefreshCw, Search, Clock, Plus, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";
import InviteModal from "@/components/modals/InviteModal";
import Swal from "sweetalert2";

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filter, Sort State
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [sortBy, setSortBy] = useState("email");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ROUTES.MANAGER.INVITATIONS);
      setInvites(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch invites", error);
      toast.error("Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleCancel = async (id: string) => {
    const result = await Swal.fire({
      title: "Cancel Invitation?",
      text: "This will revoke the invitation link.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!"
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`${API_ROUTES.MANAGER.INVITATIONS}/${id}`);
      
      await Swal.fire({
        title: "Cancelled!",
        text: "Invitation has been revoked.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      
      fetchInvites();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel invitation");
    }
  };

  const filteredInvites = useMemo(() => {
    let result = [...invites];

    // Search
    if (search) {
      const lowerTerm = search.toLowerCase();
      result = result.filter(i => 
        i.email.toLowerCase().includes(lowerTerm)
      );
    }

    // Filter
    if (filterRole !== "ALL") {
      result = result.filter(i => i.role === filterRole);
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
      } else if (sortBy === "date") {
        valA = a.createdAt || "";
        valB = b.createdAt || "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [invites, search, filterRole, sortBy, sortOrder]);

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
    const total = invites.length;
    const pending = invites.filter(i => i.status === 'PENDING').length;
    return { total, pending };
  }, [invites]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-8 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-gray-600 text-sm mt-1">Manage pending invites to your team</p>
        </div>
        <div className="flex gap-3">
            <button 
            onClick={fetchInvites} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
            <RefreshCw size={16} />
            Refresh
            </button>
            <button 
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Plus size={16} />
                Invite New
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Invites</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
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
            placeholder="Search invites by email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

          {/* Sort Toggles */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
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
              onClick={() => toggleSort("date")}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${sortBy === "date" ? "bg-blue-50 text-blue-700 font-medium" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Date <ArrowUpDown size={14} />
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
          {filteredInvites.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-600">
              No pending invitations found.
            </div>
          ) : (
            filteredInvites.map((invite) => (
              <div key={invite.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Mail className="text-orange-600" size={20} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-yellow-100 text-yellow-800">
                    <Clock size={12} />
                    PENDING
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 truncate" title={invite.email}>
                    {invite.email}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2">Role: {invite.role === 'ORG_MANAGER' ? 'Manager' : 'Member'}</p>
                  <p className="text-xs text-gray-400 mt-1">Sent: {formatDate(invite.createdAt)}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleCancel(invite.id)} 
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Cancel Invite
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <InviteModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        onSuccess={fetchInvites}
      />
    </div>
  );
}
