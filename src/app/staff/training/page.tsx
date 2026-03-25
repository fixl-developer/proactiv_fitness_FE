'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import {
    BookOpen,
    CheckCircle,
    Clock,
    Award,
    AlertCircle,
    Play,
    RotateCcw,
    ArrowRight,
    Flame,
    Timer,
    ChevronDown,
    ChevronUp,
    Layers
} from 'lucide-react'

interface TrainingModule {
    id: string
    title: string
    description: string
    category: string
    type: string
    duration: number
    difficulty: string
    status: string
    progress: number
}

interface UserProgress {
    totalModules: number
    completedModules: number
    inProgressModules: number
    certificatesEarned: number
    totalHours: number
    currentStreak: number
}

interface TrainingPath {
    id: string
    name: string
    description: string
    totalModules: number
    completedModules: number
    modules: { id: string; title: string; status: string }[]
}

export default function Training() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [modules, setModules] = useState<TrainingModule[]>([])
    const [progress, setProgress] = useState<UserProgress | null>(null)
    const [paths, setPaths] = useState<TrainingPath[]>([])
    const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadData = async () => {
            setLoading(true)
            setError(null)
            try {
                const [modulesData, progressData, pathsData] = await Promise.all([
                    supportStaffService.getTrainingModules(),
                    supportStaffService.getUserProgress(),
                    supportStaffService.getTrainingPaths()
                ])
                setModules(modulesData?.modules || [])
                setProgress(progressData || null)
                setPaths(pathsData?.paths || [])
            } catch (err: any) {
                setError(err?.message || 'Failed to load training data')
                setModules([])
                setProgress(null)
                setPaths([])
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [isAuthenticated, router])

    const togglePath = (pathId: string) => {
        setExpandedPaths(prev => ({ ...prev, [pathId]: !prev[pathId] }))
    }

    const handleModuleAction = (module: TrainingModule) => {
        if (module.status === 'completed') {
            router.push(`/staff/training/${module.id}/review`)
        } else if (module.status === 'in-progress') {
            router.push(`/staff/training/${module.id}/continue`)
        } else {
            router.push(`/staff/training/${module.id}/start`)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'in-progress':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed'
            case 'in-progress':
                return 'In Progress'
            default:
                return 'Not Started'
        }
    }

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            case 'intermediate':
                return 'bg-amber-50 text-amber-700 border border-amber-200'
            case 'advanced':
                return 'bg-red-50 text-red-700 border border-red-200'
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200'
        }
    }

    const getProgressBarColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500'
            case 'in-progress':
                return 'bg-blue-500'
            default:
                return 'bg-gray-400'
        }
    }

    const getButtonConfig = (status: string) => {
        switch (status) {
            case 'completed':
                return { label: 'Review', icon: RotateCcw, className: 'bg-green-600 hover:bg-green-700' }
            case 'in-progress':
                return { label: 'Continue', icon: Play, className: 'bg-blue-600 hover:bg-blue-700' }
            default:
                return { label: 'Start', icon: ArrowRight, className: 'bg-gray-700 hover:bg-gray-800' }
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Training & Development</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading training data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Total Modules</p>
                                <p className="text-2xl font-bold text-gray-900">{progress?.totalModules ?? 0}</p>
                            </div>

                            <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{progress?.completedModules ?? 0}</p>
                            </div>

                            <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">In Progress</p>
                                <p className="text-2xl font-bold text-gray-900">{progress?.inProgressModules ?? 0}</p>
                            </div>

                            <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Certificates Earned</p>
                                <p className="text-2xl font-bold text-gray-900">{progress?.certificatesEarned ?? 0}</p>
                            </div>
                        </div>

                        {/* Summary Section */}
                        {progress && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Training Summary</h2>
                                <div className="flex flex-wrap gap-8">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 p-2 rounded-lg">
                                            <Timer className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Total Hours</p>
                                            <p className="text-lg font-bold text-gray-900">{progress.totalHours}h</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-100 p-2 rounded-lg">
                                            <Flame className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Current Streak</p>
                                            <p className="text-lg font-bold text-gray-900">{progress.currentStreak} days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Training Modules */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-5">Training Modules</h2>
                            {modules.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No training modules available yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {modules.map((module) => {
                                        const btnConfig = getButtonConfig(module.status)
                                        const BtnIcon = btnConfig.icon
                                        return (
                                            <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-3">{module.title}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(module.status)}`}>
                                                        {getStatusLabel(module.status)}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>

                                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                        {module.category}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyBadge(module.difficulty)}`}>
                                                        {module.difficulty}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {module.duration} min
                                                    </span>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className="text-xs font-medium text-gray-600">Progress</span>
                                                        <span className="text-xs font-bold text-gray-800">{module.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(module.status)}`}
                                                            style={{ width: `${module.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <button
                                                    id={`staff-training-${module.status === 'completed' ? 'review' : module.status === 'in-progress' ? 'continue' : 'start'}-${module.id}-btn`}
                                                    onClick={() => handleModuleAction(module)}
                                                    className={`w-full text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${btnConfig.className}`}
                                                >
                                                    <BtnIcon className="w-4 h-4" />
                                                    {btnConfig.label}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Training Paths */}
                        {paths.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-5">Training Paths</h2>
                                <div className="space-y-4">
                                    {paths.map((path) => {
                                        const pathProgress = path.totalModules > 0
                                            ? Math.round((path.completedModules / path.totalModules) * 100)
                                            : 0
                                        const isExpanded = expandedPaths[path.id] ?? false

                                        return (
                                            <div key={path.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg shadow-md">
                                                                <Layers className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900">{path.name}</h3>
                                                                <p className="text-sm text-gray-500">{path.description}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap ml-4">
                                                            {path.completedModules}/{path.totalModules} modules
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 mb-3">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-xs font-medium text-gray-600">Path Progress</span>
                                                            <span className="text-xs font-bold text-gray-800">{pathProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                            <div
                                                                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                                                style={{ width: `${pathProgress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {path.modules && path.modules.length > 0 && (
                                                        <button
                                                            onClick={() => togglePath(path.id)}
                                                            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2 transition-colors"
                                                        >
                                                            {isExpanded ? (
                                                                <>
                                                                    <ChevronUp className="w-4 h-4" />
                                                                    Hide Modules
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="w-4 h-4" />
                                                                    Show Modules ({path.modules.length})
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                {isExpanded && path.modules && path.modules.length > 0 && (
                                                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                                                        <ul className="space-y-2">
                                                            {path.modules.map((mod, idx) => (
                                                                <li key={mod.id || idx} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs font-bold text-gray-400 w-6 text-center">{idx + 1}</span>
                                                                        <span className="text-sm font-medium text-gray-800">{mod.title}</span>
                                                                    </div>
                                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(mod.status)}`}>
                                                                        {getStatusLabel(mod.status)}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
