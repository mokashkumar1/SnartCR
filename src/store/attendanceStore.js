import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAttendanceStore = create((set, get) => ({
  subjects: [],
  sessions: [],
  records: [],
  currentSession: null,
  loading: false,

  // Subjects
  fetchSubjects: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })
      if (error) throw error
      set({ subjects: data || [] })
    } catch (e) {
      console.error('Fetch subjects error', e)
    }
  },

  addSubject: async (name) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('subjects')
      .insert({ user_id: user.id, name })
      .select()
      .single()
    if (error) throw error
    set((state) => ({
      subjects: [...state.subjects, data].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    return data
  },

  // Sessions
  fetchSessions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      if (error) throw error
      set({ sessions: data || [] })
    } catch (e) {
      console.error('Fetch sessions error', e)
    }
  },

  fetchRecords: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .in('session_id', get().sessions.map((s) => s.id))
      if (error) throw error
      set({ records: data || [] })
    } catch (e) {
      console.error('Fetch records error', e)
    }
  },

  createSession: async (subjectId, totalStudents) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, subject_id: subjectId, total_students: totalStudents, completed: false })
      .select()
      .single()
    if (error) throw error
    set((state) => ({
      sessions: [data, ...state.sessions],
      currentSession: data,
    }))
    return data
  },

  resumeSession: (session) => {
    set({ currentSession: session })
  },

  clearCurrentSession: () => set({ currentSession: null }),

  markAttendance: async (sessionId, studentId, status) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert({ session_id: sessionId, student_id: studentId, status }, { onConflict: 'session_id,student_id' })
      .select()
      .single()
    if (error) throw error
    set((state) => ({
      records: [
        ...state.records.filter((r) => !(r.session_id === sessionId && r.student_id === studentId)),
        data,
      ],
    }))
    return data
  },

  completeSession: async (sessionId) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()
    if (error) throw error
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? data : s)),
      currentSession: null,
    }))
    return data
  },

  deleteSession: async (sessionId) => {
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
    if (error) throw error
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      records: state.records.filter((r) => r.session_id !== sessionId),
    }))
  },

  getSessionRecords: (sessionId) => {
    return get().records.filter((r) => r.session_id === sessionId)
  },

  getSubjectSessions: (subjectId) => {
    return get().sessions.filter((s) => s.subject_id === subjectId && s.completed)
  },
}))