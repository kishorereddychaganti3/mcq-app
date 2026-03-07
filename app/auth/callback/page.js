'use client'

import { supabase } from '../../../lib/supabase'
import { useEffect } from 'react'

export default function AuthCallback() {

  useEffect(() => {
    handleAuth()
  }, [])

  async function handleAuth() {

    const { data } = await supabase.auth.getSession()

    if (data.session) {
      window.location.href = '/select-category'
    } else {
      window.location.href = '/'
    }

  }

  return (
    <div style={{
      height:'100vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      fontFamily:'system-ui'
    }}>
      Signing you in...
    </div>
  )
}