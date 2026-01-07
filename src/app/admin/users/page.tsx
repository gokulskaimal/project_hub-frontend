"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useAdminData } from "@/hooks/useAdminData";
import { User, Trash2, Ban, CheckCircle, RefreshCw, Mail, Building, Search, ArrowUpDown, Users } from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const { accessToken } = useSelector((s: RootState) => s.auth);
  const { data, actions } = useAdminData(accessToken);
  const [page , setPage] = useState(1)
  const [limit] = useState(10)
  const [search , setSearch] = useState("")
  const [role , setRole] = useState("ALL")
  const [status, setStatus] = useState("ALL")
  // Sort State (Client-side usage or future server-side)
  const [sortBy, setSortBy] = useState("email");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(()=>{
    const timeoutId = setTimeout(() =>{
      actions.fetchUsers({page,limit,search,role,status})
    },500)
    return () => clearTimeout(timeoutId)
  },[page,limit,search,role,status])

  const handleFilterChange = (setter : any , value : any) => {
    setter(value)
    setPage(1)
  }

  // Handlers
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  const confirmDeleteUser = async(userId : string) =>{
    const result = await Swal.fire({
      title : 'Are you sure?',
      text : 'You want to delete this user?',
      icon : 'warning',
      showCancelButton : true,
      confirmButtonText : 'Yes!',
      cancelButtonText : 'No, cancel!',
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    })
    if(result.isConfirmed){
      await actions.deleteUser(userId);
      actions.fetchUsers({ page, limit, search, role, status });
    }
  }

  const confirmBlockUser = async(userId : string) =>{
    const result = await Swal.fire({
      title : 'Are you sure?',
      text : 'You want to block this user?',
      icon : 'warning',
      showCancelButton : true,
      confirmButtonText : 'Yes!',
      cancelButtonText : 'No, cancel!',
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    })
    if(result.isConfirmed){
      await actions.updateUserStatus(userId,'BLOCKED');
      actions.fetchUsers({ page, limit, search, role, status });
    }
  }
  const confirmUnblockUser = async(userId : string) =>{
    const result = await Swal.fire({
      title : 'Are you sure?',
      text : 'You want to unblock this user?',
      icon : 'warning',
      showCancelButton : true,
      confirmButtonText : 'Yes!',
      cancelButtonText : 'No, cancel!',
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    })
    if(result.isConfirmed){
      await actions.updateUserStatus(userId,'ACTIVE');
      actions.fetchUsers({ page, limit, search, role, status });
    }
  }

  // Stats (Using Total from Server Response)
  const stats = useMemo(() => {
    const total = data.users.total || 0;
    // Active/Blocked counts are not returned by the paginated API for the whole DB
    // We would need separate API endpoints for stats to be accurate.
    // For now, we display Total, and maybe placeholders or remove the others.
    return { total, active: 0, blocked: 0 }; 
  }, [data.users.total]);

  return (
    <div className="p-8 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 text-sm mt-1">Manage all registered users</p>
        </div>
        <button 
          onClick={() => actions.fetchUsers({ page, limit, search, role, status })} 
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
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Ban size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Blocked/Suspended</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.blocked}</h3>
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
            placeholder="Search by name, email or org..." 
            value={search}
            onChange={(e) => handleFilterChange(setSearch,e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white placeholder-gray-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <select 
            value={role} 
            onChange={(e) => handleFilterChange(setRole, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="ORG MANAGER">Manager</option>
            <option value="TEAM MEMBER">Member</option>
          </select>

          <select 
            value={status} 
            onChange={(e) => handleFilterChange(setStatus, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
            <option value="SUSPENDED">Suspended</option>
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

      {data.loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.users.items.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-600">
              No users found matching your criteria.
            </div>
          ) : (
            data.users.items.map((user) => {
              const isBlocked = user.status === 'BLOCKED' || user.status === 'SUSPENDED';
              const isActive = user.status === 'ACTIVE';

              return (
                <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isActive ? <CheckCircle size={12} /> : <Ban size={12} />}
                      {(user.status || 'ACTIVE').toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 truncate" title={user.email}>
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail size={14} />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.orgId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Building size={14} />
                        <span className="truncate">Org ID: {user.orgId.slice(0, 8)}...</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Role: {user.role}</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {isActive ? (
                      <button 
                        onClick={() => confirmBlockUser(user.id)} 
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                        disabled={data.loading}
                      >
                        <Ban size={16} />
                        Block
                      </button>
                    ) : (
                      <button 
                        onClick={() => confirmUnblockUser(user.id)} 
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        disabled={data.loading}
                      >
                        <CheckCircle size={16} />
                        Unblock
                      </button>
                    )}
                    <button 
                      onClick={() => confirmDeleteUser(user.id)} 
                      className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                      disabled={data.loading}
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl border border-gray-200">
          <span className="text-sm text-gray-600">
             Page {data.users.page} of {data.users.totalPages} ({data.users.total} users)
          </span>
          <div className="flex gap-2">
             <button 
                disabled={data.users.page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
             >
                Previous
             </button>
             <button 
                disabled={data.users.page >= data.users.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
             >
                Next
             </button>
          </div>
       </div>
    </div>
  );
}
