'use client'

import { useState } from 'react'

const TestLoginPage = () => {
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)

    const testLogin = async () => {
        setLoading(true)
        try {
            console.log('Testing login with API URL:', process.env.NEXT_PUBLIC_API_BASE_URL)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'parent@test.com',
                    password: 'password123'
                })
            })

            console.log('Response status:', response.status)
            const data = await response.json()
            console.log('Response data:', data)

            setResult(JSON.stringify(data, null, 2))
        } catch (error) {
            console.error('Login test error:', error)
            setResult(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Login Test Page</h1>
            <p className="mb-4">API URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>

            <button
                onClick={testLogin}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
                {loading ? 'Testing...' : 'Test Login'}
            </button>

            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {result || 'Click "Test Login" to test the API'}
            </pre>
        </div>
    )
}

export default TestLoginPage