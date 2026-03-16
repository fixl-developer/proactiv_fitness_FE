import { useState, useCallback } from 'react'
import { MediaService, MediaFile, UploadOptions, UploadProgress } from '@/services/mediaService'

interface UseFileUploadOptions extends UploadOptions {
    maxSize?: number
    allowedTypes?: string[]
    onSuccess?: (file: MediaFile) => void
    onError?: (error: Error) => void
}

interface UploadState {
    isUploading: boolean
    progress: number
    error: Error | null
    uploadedFile: MediaFile | null
}

export function useFileUpload(options?: UseFileUploadOptions) {
    const [state, setState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
        uploadedFile: null
    })

    const uploadFile = useCallback(async (file: File) => {
        try {
            // Reset state
            setState({
                isUploading: true,
                progress: 0,
                error: null,
                uploadedFile: null
            })

            // Validate file
            const validation = MediaService.validateFile(file, {
                maxSize: options?.maxSize,
                allowedTypes: options?.allowedTypes
            })

            if (!validation.valid) {
                throw new Error(validation.error)
            }

            // Upload file
            const uploadedFile = await MediaService.uploadFile(
                file,
                {
                    entityType: options?.entityType,
                    entityId: options?.entityId,
                    isPublic: options?.isPublic,
                    folder: options?.folder,
                    tags: options?.tags,
                    metadata: options?.metadata
                },
                (progress: UploadProgress) => {
                    setState(prev => ({
                        ...prev,
                        progress: progress.percentage
                    }))
                }
            )

            // Success
            setState({
                isUploading: false,
                progress: 100,
                error: null,
                uploadedFile
            })

            if (options?.onSuccess) {
                options.onSuccess(uploadedFile)
            }

            return uploadedFile

        } catch (error) {
            const err = error as Error
            setState({
                isUploading: false,
                progress: 0,
                error: err,
                uploadedFile: null
            })

            if (options?.onError) {
                options.onError(err)
            }

            throw err
        }
    }, [options])

    const reset = useCallback(() => {
        setState({
            isUploading: false,
            progress: 0,
            error: null,
            uploadedFile: null
        })
    }, [])

    return {
        uploadFile,
        reset,
        ...state
    }
}

interface UseMultipleFileUploadOptions extends UploadOptions {
    maxSize?: number
    allowedTypes?: string[]
    onSuccess?: (files: MediaFile[]) => void
    onError?: (error: Error) => void
    onFileProgress?: (fileIndex: number, progress: number) => void
}

interface MultipleUploadState {
    isUploading: boolean
    overallProgress: number
    fileProgresses: number[]
    error: Error | null
    uploadedFiles: MediaFile[]
}

export function useMultipleFileUpload(options?: UseMultipleFileUploadOptions) {
    const [state, setState] = useState<MultipleUploadState>({
        isUploading: false,
        overallProgress: 0,
        fileProgresses: [],
        error: null,
        uploadedFiles: []
    })

    const uploadFiles = useCallback(async (files: File[]) => {
        try {
            // Reset state
            setState({
                isUploading: true,
                overallProgress: 0,
                fileProgresses: new Array(files.length).fill(0),
                error: null,
                uploadedFiles: []
            })

            // Validate all files
            for (const file of files) {
                const validation = MediaService.validateFile(file, {
                    maxSize: options?.maxSize,
                    allowedTypes: options?.allowedTypes
                })

                if (!validation.valid) {
                    throw new Error(`${file.name}: ${validation.error}`)
                }
            }

            // Upload files
            const uploadedFiles = await MediaService.uploadMultipleFiles(
                files,
                {
                    entityType: options?.entityType,
                    entityId: options?.entityId,
                    isPublic: options?.isPublic,
                    folder: options?.folder,
                    tags: options?.tags,
                    metadata: options?.metadata
                },
                (fileIndex: number, progress: UploadProgress) => {
                    setState(prev => {
                        const newFileProgresses = [...prev.fileProgresses]
                        newFileProgresses[fileIndex] = progress.percentage

                        const overallProgress = Math.round(
                            newFileProgresses.reduce((sum, p) => sum + p, 0) / files.length
                        )

                        if (options?.onFileProgress) {
                            options.onFileProgress(fileIndex, progress.percentage)
                        }

                        return {
                            ...prev,
                            fileProgresses: newFileProgresses,
                            overallProgress
                        }
                    })
                }
            )

            // Success
            setState({
                isUploading: false,
                overallProgress: 100,
                fileProgresses: new Array(files.length).fill(100),
                error: null,
                uploadedFiles
            })

            if (options?.onSuccess) {
                options.onSuccess(uploadedFiles)
            }

            return uploadedFiles

        } catch (error) {
            const err = error as Error
            setState(prev => ({
                ...prev,
                isUploading: false,
                error: err
            }))

            if (options?.onError) {
                options.onError(err)
            }

            throw err
        }
    }, [options])

    const reset = useCallback(() => {
        setState({
            isUploading: false,
            overallProgress: 0,
            fileProgresses: [],
            error: null,
            uploadedFiles: []
        })
    }, [])

    return {
        uploadFiles,
        reset,
        ...state
    }
}
