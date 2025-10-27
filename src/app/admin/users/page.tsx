'use client'
import React, { useEffect, useState } from 'react'
import Table from '../../../components/Table'
import { api, API_ROUTES } from '../../../utils/api'

type User = { id: string, email: string, name?: string, role: string, orgId?: string }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get(API_ROUTES.ADMIN.USERS)
      .then((res) => setUsers(res.data))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Table columns={[
        { key: 'email', header: 'Email' },
        { key: 'name', header: 'Name' },
        { key: 'role', header: 'Role' },
        { key: 'orgId', header: 'Org' },
      ]} data={users} />
    </div>
  )
}


