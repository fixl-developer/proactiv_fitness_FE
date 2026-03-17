'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DataManagementService, { ImportJob } from '@/services/modules/data-management.service'
import { motion } from 'framer-motion'
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ImportPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [jobs, setJobs] = useState<ImportJob[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadJobs()
    }, [isAuthenticated, router])

    const loadJobs = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await DataManagementService.getImportJobs()
            setJobs(response)
        } catch (err) {
            console.error('Error loading jobs:', err)
            setError('Failed to load import jobs')
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async () => {
        if (!selectedFile) {
            alert('Please select a file')
            return
        }
        try {
            await DataManagementService.importData(selectedFile, {})
            await loadJobs()
            setSelectedFile(null)
        } catch (err) {
            console.error('Error importing:', err)
            alert('Failed to import data')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Import Data</h1>
                    <p className="text-gray-600">Upload data from files</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload File</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="file-input"
                                    />
                                    <label htmlFor="file-input" className="cursor-pointer">
                                        <p className="text-sm text-gray-600">Click to select file</p>
                                        {selectedFile && <p className="text-sm font-medium mt-2">{selectedFile.name}</p>}
                                    </label>
                                </div>
                                <Button onClick={handleImport} disabled={!selectedFile} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                                    Import
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Import History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {jobs.map((job, idx) => (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-4 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {job.status === 'completed' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : job.status === 'failed' ? (
                                                        <XCircle className="w-5 h-5 text-red-600" />
                                                    ) : (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium">{job.fileName}</p>
                                                        <p className="text-sm text-gray-600">{job.processedRecords}/{job.totalRecords} records</p>
                                                    </div>
                                                </div>
                                                <Badge className={`${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {job.status}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
