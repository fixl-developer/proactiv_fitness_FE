'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RestorePage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [selectedBackup, setSelectedBackup] = useState('')
    const [backups] = useState([
        { id: '1', name: 'Full Backup - 2026-03-16', date: '2026-03-16' },
        { id: '2', name: 'Full Backup - 2026-03-15', date: '2026-03-15' },
        { id: '3', name: 'Full Backup - 2026-03-14', date: '2026-03-14' }
    ])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        setLoading(false)
    }, [isAuthenticated, router])

    const handleRestore = () => {
        if (!selectedBackup) {
            alert('Please select a backup to restore')
            return
        }
        if (confirm('Are you sure you want to restore this backup? This action cannot be undone.')) {
            alert('Restore initiated successfully')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading restore options...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Restore Backup</h1>
                    <p className="text-gray-600">Select a backup to restore</p>
                </div>

                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-900">Warning</p>
                        <p className="text-sm text-yellow-800">Restoring a backup will overwrite current data. This action cannot be undone.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-blue-600" />
                            Select Backup
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mb-6">
                            {backups.map((backup) => (
                                <div
                                    key={backup.id}
                                    onClick={() => setSelectedBackup(backup.id)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedBackup === backup.id
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{backup.name}</p>
                                            <p className="text-sm text-gray-600">{backup.date}</p>
                                        </div>
                                        {selectedBackup === backup.id && (
                                            <CheckCircle className="w-6 h-6 text-blue-600" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleRestore}
                                disabled={!selectedBackup}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore Selected Backup
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/superadmin/backups')}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
