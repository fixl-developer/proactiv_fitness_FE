'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const AuthDebug = () => {
    const { user, isLoading } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [localStorageData, setLocalStorageData] = useState({
        token: false,
        user: false
    })

    useEffect(() => {
        setMounted(true)
        setLocalStorageData({
            token: !!localStorage.getItem('token'),
            user: !!localStorage.getItem('user')
        })
    }, [])

    if (process.env.NODE_ENV !== 'development' || !mounted) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
            <h4 className="font-bold mb-2">🐛 Auth Debug</h4>
            <div className="space-y-1">
                <div>Loading: {isLoading ? '✅' : '❌'}</div>
                <div>Authenticated: {user ? '✅' : '❌'}</div>
                <div>User: {user ? '✅' : '❌'}</div>
                {user && (
                    <div className="mt-2 p-2 bg-gray-800 rounded">
                        <div>Email: {user.email}</div>
                        <div>Role: {typeof user.role === 'string' ? user.role : user.role?.name}</div>
                        <div>Name: {user.name}</div>
                    </div>
                )}
                <div className="mt-2">
                    <div>LocalStorage Token: {localStorageData.token ? '✅' : '❌'}</div>
                    <div>LocalStorage User: {localStorageData.user ? '✅' : '❌'}</div>
                </div>
            </div>
        </div>
    )
}

export default AuthDebug
