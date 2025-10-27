'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  // Auth and role guard
  const { isLoggedIn, role } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (!isLoggedIn || role !== 'manager') {
      router.push('/login');
    }
  }, [isLoggedIn, role, router]);

  // Profile modal/image state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  // removed modal mode state (unused)

  // removed unused file upload helpers

  const openUserModal = () => {
    setShowUserModal(true);
  };

  // Sidebar links
  const sidebarLinks = [
    { name: 'Dashboard', active: true },
    { name: 'Projects' },
    { name: 'Kanban Board' },
    { name: 'Calendar' },
    { name: 'Chat' },
    { name: 'Tickets' },
    { name: 'Team' },
    { name: 'Billing' },
    { name: 'Settings', borderTop: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 px-6 border-b border-gray-200 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">PM</span>
            </div>
            <span className="text-gray-900 font-semibold">ProjectHub</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarLinks.map((item) => (
            <a
              key={item.name}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${item.active ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-gray-700 hover:bg-gray-50'} ${item.borderTop ? 'border-t border-gray-200 mt-3 pt-4' : ''}`}
            >
              <span className="w-5 h-5 inline-block bg-gray-100 rounded"></span>
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 w-80">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-500 outline-none" placeholder="Search projects, tasks, users..." aria-label="Global search" />
            <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5"><span className="text-xs text-gray-500">⌘</span><span className="text-xs text-gray-500">K</span></div>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="relative p-2" aria-label="View notifications">
              <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-5 5-5-5h5V7a3 3 0 116 0v10zM9 12H4l5-5 5 5H9v5a3 3 0 01-6 0v-5z"/>
              </svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"><span className="text-xs text-white font-semibold">2</span></div>
            </button>
            <button onClick={openUserModal} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-sm font-medium text-gray-900">S</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Organization Dashboard</h1>
              <p className="text-gray-600">Manage your team, projects, and organization performance</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
              >
                <span className="w-4 h-4 bg-blue-600 rounded inline-flex"></span>
                <span className="text-sm font-medium">Invite Team</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                <span className="w-4 h-4 bg-gray-600 rounded inline-flex"></span>
                <span className="text-sm font-medium">New Project</span>
              </button>
            </div>
          </div>

          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Active Projects</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
              <div className="text-sm text-gray-500">+2 from last month</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Team Members</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">24</div>
              <div className="text-sm text-gray-500">+3 new this week</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tasks Completed</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">156</div>
              <div className="text-sm text-gray-500">+12% from last week</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">$45.2k</div>
              <div className="text-sm text-gray-500">+8% from last month</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => openUserModal()} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <span className="w-10 h-10 bg-blue-100 rounded-lg flex"></span>
                <div>
                  <h3 className="font-medium text-gray-900">View Profile</h3>
                  <p className="text-sm text-gray-500">Manage your account settings</p>
                </div>
              </button>
              <button onClick={() => openUserModal()} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <span className="w-10 h-10 bg-green-100 rounded-lg flex"></span>
                <div>
                  <h3 className="font-medium text-gray-900">Edit Profile</h3>
                  <p className="text-sm text-gray-500">Update your information</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <span className="w-10 h-10 bg-purple-100 rounded-lg flex"></span>
                <div>
                  <h3 className="font-medium text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-500">Check performance metrics</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-80" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl max-w-2xl w-full mx-4 p-6">
            {/* Modal content as in your previous code... (inputs/selects/action buttons) */}
            <button type="button" onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100" aria-label="Close invitation modal">
              <span className="w-4 h-4 bg-gray-500 inline-block rounded" />
            </button>
            {/* ...rest of invite modal */}
            {/* Use your previous code for the form and modal structure */}
          </div>
        </div>
      )}

      {/* User Info Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-80" onClick={() => setShowUserModal(false)} />
          {/* ...modal code for profile/user info from your previous markup */}
        </div>
      )}
    </div>
  );
}
