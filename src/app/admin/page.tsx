'use client'
import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import { api } from '../../utils/api'

type Org = { id: string, name: string }

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/admin/orgs')
      .then((res) => setOrgs(res.data))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Organizations</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Table columns={[
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
      ]} data={orgs} />
    </div>
  )
}


