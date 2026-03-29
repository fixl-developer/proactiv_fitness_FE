'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import apiClient from '@/lib/apiClient'

interface ImageUploaderProps {
    value: string
    onChange: (url: string) => void
    folder?: string
    label?: string
    maxSizeMB?: number
}

export default function ImageUploader({
    value,
    onChange,
    folder = 'cms',
    label = 'Image',
    maxSizeMB = 10,
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const maxBytes = maxSizeMB * 1024 * 1024

    const handleUpload = useCallback(async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed (JPEG, PNG, WebP, GIF, SVG)')
            return
        }

        // Validate file size
        if (file.size > maxBytes) {
            setError(`File size must be less than ${maxSizeMB}MB. Current: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
            return
        }

        setError(null)
        setUploadSuccess(false)

        try {
            setUploading(true)

            const formData = new FormData()
            formData.append('image', file)
            formData.append('folder', folder)

            const response = await apiClient.post<any>(
                '/api/v1/admin/cms/media/upload-image',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 60000, // 60s timeout for uploads
                }
            )

            if (response.data?.data?.url) {
                onChange(response.data.data.url)
                setUploadSuccess(true)
                setTimeout(() => setUploadSuccess(false), 3000)
            } else {
                throw new Error('No URL returned from upload')
            }
        } catch (err: any) {
            console.error('Upload failed:', err)

            // Check if it's a Cloudinary config error
            if (err?.response?.status === 503) {
                setError('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to your environment variables.')
            } else if (err?.response?.status === 401 || err?.response?.status === 403) {
                setError('You do not have permission to upload images. Admin access required.')
            } else {
                setError('Upload failed. You can also paste an image URL directly in the text field above.')
            }
        } finally {
            setUploading(false)
            // Reset file input so same file can be selected again
            if (fileRef.current) fileRef.current.value = ''
        }
    }, [folder, maxBytes, maxSizeMB, onChange])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOver(false)

        const file = e.dataTransfer.files[0]
        if (file) handleUpload(file)
    }, [handleUpload])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOver(false)
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }, [handleUpload])

    const clearImage = useCallback(() => {
        onChange('')
        setError(null)
        setUploadSuccess(false)
    }, [onChange])

    return (
        <div className="space-y-3">
            {/* URL Input - always available as fallback */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => {
                        onChange(e.target.value)
                        setError(null)
                    }}
                    placeholder="Paste image URL here or upload below"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200
                    ${uploading ? 'pointer-events-none' : ''}
                    ${dragOver
                        ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }
                    ${error ? 'border-red-300 bg-red-50/50' : ''}
                    ${uploadSuccess ? 'border-green-300 bg-green-50/50' : ''}
                `}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-blue-600">Uploading to Cloudinary...</span>
                        <span className="text-xs text-gray-400">Please wait</span>
                    </div>
                ) : uploadSuccess ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Uploaded successfully!</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <Upload className={`w-6 h-6 ${dragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-700">
                                {dragOver ? 'Drop image here' : 'Click to upload or drag & drop'}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                                JPEG, PNG, WebP, GIF, SVG (max {maxSizeMB}MB)
                            </p>
                        </div>
                    </div>
                )}

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Image Preview */}
            {value && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="relative flex-shrink-0">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-20 h-20 rounded-lg object-cover border border-gray-200 bg-white"
                            onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiI+Tm8gaW1nPC90ZXh0Pjwvc3ZnPg=='
                            }}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                clearImage()
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                            title="Remove image"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium mb-1">Current Image URL:</p>
                        <p className="text-xs text-gray-400 break-all line-clamp-3">{value}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
