"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useAdminData } from "@/hooks/useAdminData";
import { Building, Trash2, Ban, CheckCircle, RefreshCw, Search, ArrowUpDown, Building2 } from "lucide-react";

export default function AdminOrgsPage() {
  const { accessToken } = useSelector((s: RootState) => s.auth);
  const { data, actions } = useAdminData(accessToken);

  // Search, Filter, Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    actions.fetchData();
  }, [actions.fetchData]);

  // Derived Data
  const filteredOrgs = useMemo(() => {
    let result = [...data.orgs];

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(org => 
        org.name.toLowerCase().includes(lowerTerm)
      );
    }

    // Filter
    if (filterStatus !== "ALL") {
      result = result.filter(org => (org.status || 'ACTIVE') === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let valA = "";
      let valB = "";

      if (sortBy === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === "status") {
        valA = a.status || "ACTIVE";
        valB = b.status || "ACTIVE";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [data.orgs, searchTerm, filterStatus, sortBy, sortOrder]);

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
    const total = data.orgs.length;
    const active = data.orgs.filter(o => (o.status || 'ACTIVE') === 'ACTIVE').length;
    const suspended = data.orgs.filter(o => (o.status || 'ACTIVE') !== 'ACTIVE').length;
    return { total, active, suspended };
  }, [data.orgs]);

  return (
    <div className="p-8 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 text-sm mt-1">Manage registered organizations and their status</p>
        </div>
        <button 
          onClick={actions.fetchData} 
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
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Organizations</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Orgs</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Ban size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Suspended Orgs</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.suspended}</h3>
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
            placeholder="Search by organization name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white placeholder-gray-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
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
          {filteredOrgs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-600">
              No organizations found matching your criteria.
            </div>
          ) : (
            filteredOrgs.map((org) => {
              const isBlocked = org.status === 'BLOCKED' || org.status === 'SUSPENDED';
              const isActive = org.status === 'ACTIVE';

              return (
                <div key={org.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Building className="text-blue-600" size={20} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isActive ? <CheckCircle size={12} /> : <Ban size={12} />}
                      {(org.status || 'ACTIVE').toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 truncate" title={org.name}>
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">ID: {org.id.slice(0, 8)}...</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {isActive ? (
                      <button 
                        onClick={() => actions.updateOrgStatus(org.id, 'SUSPENDED')} 
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                        disabled={data.loading}
                      >
                        <Ban size={16} />
                        Block
                      </button>
                    ) : (
                      <button 
                        onClick={() => actions.updateOrgStatus(org.id, 'ACTIVE')} 
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        disabled={data.loading}
                      >
                        <CheckCircle size={16} />
                        Unblock
                      </button>
                    )}
                    <button 
                      onClick={() => actions.deleteOrg(org.id)} 
                      className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Organization"
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
    </div>
  );
}
