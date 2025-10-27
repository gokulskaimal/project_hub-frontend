"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LegacyAcceptInviteRedirect() {
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    const token = search.get('token')
    if (token) {
      router.replace(`/invite/accept/${encodeURIComponent(token)}`)
    } else {
      router.replace('/404')
    }
  }, [router, search])

  return null
}
