import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { veloraApi } from './api'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [veloraApi.reducerPath]: veloraApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(veloraApi.middleware),
})

setupListeners(store.dispatch)
