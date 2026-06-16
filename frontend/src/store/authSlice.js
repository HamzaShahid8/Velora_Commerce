import { createSlice } from '@reduxjs/toolkit'

const storedUser = localStorage.getItem('velora_user')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      if (action.payload) localStorage.setItem('velora_user', JSON.stringify(action.payload))
    },
    clearUser(state) {
      state.user = null
      localStorage.removeItem('velora_user')
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
export const selectCurrentUser = (state) => state.auth.user
export default authSlice.reducer
