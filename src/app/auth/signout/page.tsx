'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import BookingHeader from '@/components/layout/BookingHeader'

const SignOutPage = () => {
    useEffect(() => {
        // Handle sign out logic here
        // Clear user session, tokens, etc.
        localStorage.removeItem('userToken')
        sessionStorage.clear()

        // Redirect to home page after 3 seconds
        const timer = setTimeout(() => {
            window.location.href = '/'
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <>
            <BookingHeader />
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <Image
                            src="/images/colorlogo.webp"
                            alt="ProActive Sports"
                            width={120}
                            height={38}
                            className="h-12 w-auto"
                        />
                    </div>
                    <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Successfully Signed Out
                            </h2>
                            <p className="text-gray-600 mb-6">
                                You have been successfully signed out of your account.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                You will be redirected to the home page in a few seconds...
                            </p>
                            <div className="space-y-3">
                                <Link
                                    href="/"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Go to Home Page
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Sign In Again
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignOutPage