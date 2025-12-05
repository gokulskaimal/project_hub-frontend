"use client";

import React from "react";

export default function MemberProjectsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">My Projects</h1>
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
        <p className="text-gray-500">You don't have any active projects yet.</p>
      </div>
    </div>
  );
}
