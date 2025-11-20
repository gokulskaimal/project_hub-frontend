import React from "react";

type Props = {
  email: string;
  name: string;
  role: string;
  status?: string;
};

export default function UserInfoView({ email, name, role, status = "ACTIVE" }: Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-3">User Information</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="font-medium text-gray-700">Email:</span><span className="text-gray-900">{email || '-'}</span></div>
        <div className="flex justify-between"><span className="font-medium text-gray-700">Name:</span><span className="text-gray-900">{name}</span></div>
        <div className="flex justify-between"><span className="font-medium text-gray-700">Role:</span><span className="text-gray-900">{(role || '').toUpperCase()}</span></div>
        <div className="flex justify-between"><span className="font-medium text-gray-700">Status:</span><span className="text-gray-900">{status}</span></div>
      </div>
    </div>
  );
}
