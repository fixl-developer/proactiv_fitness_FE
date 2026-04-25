'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, AlertCircle, Plus } from 'lucide-react'
import apiClient from '@/lib/apiClient'

interface ImageArrayUploaderProps {
    value: string[]
    onChange: (urls: string[]) => void
    folder?: string
    maxImages?: number
    maxSizeMB?: number
}

export default function ImageArrayUploader({
    value,
    onChange,
    folder = 'cms',
    maxImages = 20,
    maxSizeMB = 10,
}: ImageArrayUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const maxBytes = maxSizeMB * 1024 * 1024
    const images = value || []
    const slotsLeft = Math.max(0, maxImages - images.length)

    const uploadFiles = useCallback(async (files: File[]) => {
        if (files.length === 0) return

        // Cap at remaining slots
        const toUpload = files.slice(0, slotsLeft)
        if (toUpload.length < files.length) {
            setError(`Only ${slotsLeft} more image(s) can be added. Max is ${maxImages}.`)
        }

        // Validate
        for (const f of toUpload) {
            if (!f.type.startsWith('image/')) {
                setError(`"${f.name}" is not a valid image`)
                return
            }
            if (f.size > maxBytes) {
                setError(`"${f.name}" exceeds ${maxSizeMB}MB`)
                return
            }
        }

        setError(null)
        setUploading(true)

        try {
            const formData = new FormData()
            toUpload.forEach(f => formData.append('images', f))
            formData.append('folder', folder)

            // Do NOT set Content-Type — axios interceptor builds multipart boundary.
            const response = await apiClient.post<any>(
                '/admin/cms/media/upload-images',
                formData,
                { timeout: 120000 }
            )

            const newUrls: string[] = (response.data || [])
                .map((item: any) => item?.url)
                .filter(Boolean)

            if (newUrls.length > 0) {
                onChange([...(value || []), ...newUrls])
            }
            if (newUrls.length !== toUpload.length) {
                setError('Some images failed to upload.')
            }
        } catch (err: any) {
            console.error('Upload failed:', err)
            const serverMsg = err?.response?.data?.message
            const status = err?.response?.status
            if (status === 503) setError(serverMsg || 'Cloudinary is not configured on the server.')
            else if (status === 401 || status === 403) setError('Admin access required.')
            else if (status === 413) setError(`File too large. Max ${maxSizeMB}MB per image.`)
            else if (!err?.response) setError('Cannot reach the server.')
            else setError(serverMsg || 'Upload failed. You can paste image URLs manually below.')
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }, [value, onChange, folder, maxBytes, maxSizeMB, slotsLeft, maxImages])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        uploadFiles(files)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOver(false)
        uploadFiles(Array.from(e.dataTransfer.files))
    }

    const removeAt = (idx: number) => {
        const next = [...images]
        next.splice(idx, 1)
        onChange(next)
    }

    const updateUrlAt = (idx: number, url: string) => {
        const next = [...images]
        next[idx] = url
        onChange(next)
    }

    const addEmptyUrl = () => {
        if (images.length < maxImages) onChange([...images, ''])
    }

    return (
        <div className="space-y-3">
            {/* Upload zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
                onDrop={handleDrop}
                onClick={() => !uploading && slotsLeft > 0 && fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
                    ${uploading ? 'pointer-events-none opacity-60' : ''}
                    ${slotsLeft === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                    ${error ? 'border-red-300 bg-red-50/40' : ''}`}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="text-sm text-blue-600 font-medium">Uploading…</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                            {slotsLeft === 0
                                ? `Limit reached (${maxImages})`
                                : 'Click or drag images here to upload'}
                        </span>
                        <p className="text-xs text-gray-400">{images.length} / {maxImages} images</p>
                    </div>
                )}
                <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading || slotsLeft === 0}
                />
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Image list */}
            {images.length > 0 && (
                <div className="space-y-2">
                    {images.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            {url ? (
                                <img
                                    src={url}
                                    alt={`Image ${idx + 1}`}
                                    className="w-12 h-12 rounded object-cover bg-white border border-gray-200 flex-shrink-0"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }}
                                />
                            ) : (
                                <div className="w-12 h-12 rounded bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs flex-shrink-0">URL</div>
                            )}
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => updateUrlAt(idx, e.target.value)}
                                placeholder="Paste image URL or upload above"
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => removeAt(idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Manual URL row */}
            {slotsLeft > 0 && (
                <button
                    type="button"
                    onClick={addEmptyUrl}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    <Plus className="w-4 h-4" /> Add image URL manually
                </button>
            )}
        </div>
    )
}
