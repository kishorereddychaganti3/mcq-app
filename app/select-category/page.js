'use client'

import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export default function SelectCategory() {

  const [examPref, setExamPref] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  async function init() {

    console.log("🟣 SELECT CATEGORY LOADED")

    await new Promise(r => setTimeout(r, 500))

    const { data } = await supabase.auth.getUser()

    console.log("🟣 USER IN SELECT:", data)

    if (!data?.user) {
      console.log("🔴 NO USER IN SELECT → redirecting to login")
      window.location.href = '/'
      return
    }

    const email = data.user.email
    console.log("🟣 EMAIL:", email)

    const { data: student } = await supabase
      .from('students')
      .select('exam_preference')
      .eq('email', email)
      .single()

    console.log("🟣 STUDENT:", student)

    if (student?.exam_preference) {
      setExamPref(student.exam_preference)
    }

    setLoading(false)
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>
  }

  return <div>Loaded successfully. Exam: {examPref}</div>
}
