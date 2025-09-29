/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
    email: string,
    password: string,
    isLoggedIn: boolean
    error: string | null
    loading: boolean

    signupStep: number
    otp: string
    name: string
    otpResendAvailableAt: number | null
    accessToken: string | null
    role: string | null
}

const initialState: AuthState = {
    email: '',
    password: '',
    isLoggedIn: false,
    error: null,
    loading: false,
    signupStep: 1,
    otp: '',
    name: '',
    otpResendAvailableAt: null,
    accessToken : null,
    role : null
}

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'}/api`,
  withCredentials: true,
})

export const loginUser = createAsyncThunk<{ accessToken: string; role: string }, { email: string, password: string }, { rejectValue: string }>(
    'auth/loginUser',
    async (credentials, thunkAPI) => {
        try {
            const response = await api.post('/auth/login', credentials)
            return response.data
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message
                if (message) {
                    return thunkAPI.rejectWithValue(message)
                }
            }
            return thunkAPI.rejectWithValue('Network error')
        }
    }
)

export const sendOtp = createAsyncThunk<void, { email: string }, { rejectValue: string }>(
    'auth/sendOtp',
    async ({ email }, thunkAPI) => {
        try {
            await api.post('/auth/send-otp', { email })
        } catch (err: any) {
            if (err.response?.data?.message) return thunkAPI.rejectWithValue(err.response.data.message)
            return thunkAPI.rejectWithValue('Network Error')
        }
    }
)

export const resendOtp = createAsyncThunk<void, { email: string }, { rejectValue: string }>(
    'auth/resendOtp',
    async ({ email }, thunkAPI) => {
        try {
            await api.post('/auth/send-otp', { email })
        } catch (err: any) {
            if (err.response?.data?.message) return thunkAPI.rejectWithValue(err.response.data.message)
            return thunkAPI.rejectWithValue('Network Error')
        }
    }
)

export const verifyOtp = createAsyncThunk<void, { email: string, otp: string }, { rejectValue: string }>(
    'auth/verifyOtp',
    async ({ email, otp }, thunkAPI) => {
        try {
            await api.post('/auth/verify-otp', { email, otp })
        } catch (err: any) {
            if (err.response?.data?.message) return thunkAPI.rejectWithValue(err.response.data.message)
            return thunkAPI.rejectWithValue('Network Error')
        }
    }
)

export const completeSignup = createAsyncThunk<void, { email: string, name: string, password: string }, { rejectValue: string }>(
    'auth/completeSignup',
    async ({ email, name, password }, thunkAPI) => {
        try {
            await api.post('/auth/complete-signup', { email, name, password })
        } catch (err: any) {
            if (err.response?.data?.message) return thunkAPI.rejectWithValue(err.response.data.message)
            return thunkAPI.rejectWithValue('Network Error')
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setEmail(state, action: PayloadAction<string>) {
            state.email = action.payload
        },
        setPassword(state, action: PayloadAction<string>) {
            state.password = action.payload
        },
        setOtp(state, action: PayloadAction<string>) {
            state.otp = action.payload
        },
        setName(state, action: PayloadAction<string>) {
            state.name = action.payload
        },
        setSignupStep(state, action: PayloadAction<number>) {
            state.signupStep = action.payload
        },
        logout(state) {
            state.isLoggedIn = false
            state.email = ''
            state.password = ''
            state.error = null
            state.loading = false
            state.signupStep = 1
            state.otp = ''
            state.name = ''
            state.otpResendAvailableAt = null
            state.accessToken = null
            state.role = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true
            state.error = null
        })
            .addCase(loginUser.fulfilled, (state , action) => {
                state.loading = false
                state.isLoggedIn = true
                state.error = null
                state.accessToken = action.payload.accessToken
                state.role = action.payload.role
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = (typeof action.payload === 'string') ? action.payload : 'Failed to Login'
                state.isLoggedIn = false
                state.accessToken = null
            })
            .addCase(sendOtp.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.loading = false
                state.signupStep = 2
                state.otpResendAvailableAt = Date.now() + 60_000
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false
                state.error = (typeof action.payload === 'string') ? action.payload : 'Failed to send OTP'
            })
            .addCase(resendOtp.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.loading = false
                state.otpResendAvailableAt = Date.now() + 60_000
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.loading = false
                state.error = (typeof action.payload === 'string') ? action.payload : 'Failed to resend OTP'
            })
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(verifyOtp.fulfilled, (state) => {
                state.loading = false
                state.signupStep = 3
                state.otpResendAvailableAt = null
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false
                state.error = (typeof action.payload === 'string') ? action.payload : 'OTP verification failed'
            })
            .addCase(completeSignup.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(completeSignup.fulfilled, (state) => {
                state.loading = false
                state.signupStep = 1
                state.email = ''
                state.otp = ''
                state.name = ''
                state.password = ''
                state.error = null
                state.otpResendAvailableAt = null
            })
            .addCase(completeSignup.rejected, (state, action) => {
                state.loading = false
                state.error = (typeof action.payload === 'string') ? action.payload : 'Signup failed'
            })
    }
})

export const { setEmail, setPassword, logout, setOtp, setName, setSignupStep } = authSlice.actions
export default authSlice.reducer
