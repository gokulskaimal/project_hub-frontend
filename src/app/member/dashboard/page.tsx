"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function MemberDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName || "Member"}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here is an overview of your assigned tasks and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Stats Cards */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Assigned Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">No recent activity</h3>
        <p className="mt-2 text-gray-500">
          You haven't been assigned to any projects yet.
        </p>
      </div>
    </div>
  );
}
