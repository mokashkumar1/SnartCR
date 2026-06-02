import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useStudentsStore = create((set, get) => ({
  students: [],
  loading: false,

  fetchStudents: async () => {
    set({ loading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('roll_number', { ascending: true })
      if (error) throw error
      set({ students: data || [] })
    } catch (e) {
      console.error('Fetch students error', e)
    } finally {
      set({ loading: false })
    }
  },

  addStudent: async (roll_number, name) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('students')
      .insert({ user_id: user.id, roll_number, name })
      .select()
      .single()
    if (error) throw error
    set((state) => ({
      students: [...state.students, data].sort((a, b) => a.roll_number.localeCompare(b.roll_number)),
    }))
    return data
  },

  addStudentsBulk: async (studentsList) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const rows = studentsList.map((s) => ({ user_id: user.id, roll_number: s.roll_number, name: s.name }))
    const { data, error } = await supabase.from('students').insert(rows).select()
    if (error) throw error
    await get().fetchStudents()
    return data
  },

  updateStudent: async (id, updates) => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? data : s)).sort((a, b) => a.roll_number.localeCompare(b.roll_number)),
    }))
    return data
  },

  deleteStudent: async (id) => {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) throw error
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
    }))
  },

  clearStudents: () => set({ students: [] }),
}))