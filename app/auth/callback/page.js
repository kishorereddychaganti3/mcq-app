'use client'

import { supabase } from '../../../lib/supabase'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {

  const router = useRouter()

  useEffect(() => {
    handleAuth()
  }, [])

  async function handleAuth() {

    // ✅ small delay allows session to hydrate
    await new Promise(r => setTimeout(r, 500))

    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
      router.replace('/')
      return
    }

    const email = userData.user.email

    const { data: student } = await supabase
      .from('students')
      .select('exam_preference')
      .eq('email', email)
      .single()

    if (!student || !student.exam_preference) {
      router.replace('/signup')
    } else {
      router.replace('/select-category')
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
