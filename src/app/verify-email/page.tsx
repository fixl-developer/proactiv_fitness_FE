'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const VerifyEmailPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const token = searchParams.get('token')

        if (!token) {
            setStatus('error')
            setMessage('Invalid verification link. Please check your email for the correct link.')
            return
        }

        verifyEmail(token)
    }, [searchParams])

    const verifyEmail = async (token: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email/${token}`)
            const result = await response.json()

            if (result.success) {
                setStatus('success')
                setMessage(result.message || 'Email verified successfully!')
            } else {
                setStatus('error')
                setMessage(result.message || 'Email verification failed.')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Network error. Please try again.')
        }
    }

    const handleGoToLogin = () => {
        router.push('/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <Card className="backdrop-blur-xl bg-white/70 border-2 border-white/50 shadow-2xl shadow-blue-500/10 rounded-2xl">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Email Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        {status === 'loading' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
                                <p className="text-gray-600">Verifying your email address...</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                                        Verification Successful!
                                    </h3>
                                    <p className="text-gray-600 text-sm">{message}</p>
                                </div>
                                <Button
                                    onClick={handleGoToLogin}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    Continue to Sign In
                                </Button>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                                        Verification Failed
                                    </h3>
                                    <p className="text-gray-600 text-sm">{message}</p>
                                </div>
                                <div className="space-y-2">
                                    <Button
                                        onClick={handleGoToLogin}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Go to Sign In
                                    </Button>
                                    <p className="text-xs text-gray-500">
                                        Need help? Contact support at support@proactivsports.net
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default VerifyEmailPage