"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LegacyAcceptInviteRedirectContent() {
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

export default function LegacyAcceptInviteRedirect() {
  return (
    <Suspense>
      <LegacyAcceptInviteRedirectContent />
    </Suspense>
  )
}
