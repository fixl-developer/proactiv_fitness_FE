'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
    BookOpen, Clock, Award, ExternalLink, Search, Star,
    Plus, Pencil, Trash2, X, FileText, Video, Globe,
    GraduationCap, Layers, Flame, Filter, AlertCircle, Loader2
} from 'lucide-react'
import {
    trainingResourceService,
    TrainingResource,
    UserStats,
    ResourceCategory,
    ResourceType,
    SaveResourceInput,
} from '@/services/trainingResourceService'
import { toast } from 'sonner'

const CATEGORIES: { value: ResourceCategory; label: string }[] = [
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'product-knowledge', label: 'Product Knowledge' },
    { value: 'tools-systems', label: 'Tools & Systems' },
    { value: 'soft-skills', label: 'Soft Skills' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'other', label: 'Other' },
]

const TYPES: { value: ResourceType; label: string }[] = [
    { value: 'document', label: 'Document' },
    { value: 'video', label: 'Video' },
    { value: 'article', label: 'Article' },
    { value: 'course', label: 'Course' },
    { value: 'pdf', label: 'PDF' },
    { value: 'link', label: 'Link' },
]

const TYPE_ICON: Record<ResourceType, any> = {
    document: FileText,
    video: Video,
    article: BookOpen,
    course: GraduationCap,
    pdf: FileText,
    link: Globe,
}

const TYPE_COLOR: Record<ResourceType, string> = {
    document: 'bg-blue-100 text-blue-700',
    video: 'bg-rose-100 text-rose-700',
    article: 'bg-emerald-100 text-emerald-700',
    course: 'bg-purple-100 text-purple-700',
    pdf: 'bg-amber-100 text-amber-700',
    link: 'bg-gray-100 text-gray-700',
}

const MANAGER_ROLES = ['ADMIN', 'SUPER_ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER', 'MANAGER']

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

const stringifyRole = (r: any): string => {
    if (!r) return ''
    if (typeof r === 'string') return r
    if (typeof r === 'object') return r.name || r.role || ''
    return ''
}

export default function Training() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [resources, setResources] = useState<TrainingResource[]>([])
    const [stats, setStats] = useState<UserStats | null>(null)

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<ResourceCategory | ''>('')
    const [type, setType] = useState<ResourceType | ''>('')

    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<TrainingResource | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const userRole = useMemo(() => stringifyRole((user as any)?.role).toUpperCase(), [user])
    const canManage = MANAGER_ROLES.includes(userRole)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated])

    useEffect(() => {
        if (!isAuthenticated) return
        const t = setTimeout(() => loadResources(), 300)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, category, type])

    const loadAll = async () => {
        setLoading(true)
        setError(null)
        try {
            const [list, statsRes] = await Promise.all([
                trainingResourceService.list({ search, category, type, page: 1, limit: 100 }),
                trainingResourceService.myStats().catch(() => null),
            ])
            setResources(list?.resources || [])
            setStats(statsRes || null)
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to load training resources')
        } finally {
            setLoading(false)
        }
    }

    const loadResources = async () => {
        try {
            const list = await trainingResourceService.list({ search, category, type, page: 1, limit: 100 })
            setResources(list?.resources || [])
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to load training resources')
        }
    }

    const reloadStats = async () => {
        try {
            const s = await trainingResourceService.myStats()
            setStats(s)
        } catch { /* silent */ }
    }

    const handleOpen = async (r: TrainingResource) => {
        const win = window.open(r.url, '_blank', 'noopener,noreferrer')
        if (!win) {
            toast.error('Popup blocked. Please allow popups to open the resource.')
            return
        }
        try {
            await trainingResourceService.recordView(r._id || (r as any).id)
            // Optimistic local update
            setResources(prev =>
                prev.map(x => (x._id === r._id ? { ...x, viewCount: (x.viewCount || 0) + 1, lastOpenedAt: new Date().toISOString() } : x))
            )
            reloadStats()
        } catch {
            // network failed but resource still opened — silent
        }
    }

    const handleSubmit = async (input: SaveResourceInput) => {
        setSubmitting(true)
        try {
            if (editing) {
                await trainingResourceService.update(editing._id, input)
                toast.success('Resource updated')
            } else {
                await trainingResourceService.create(input)
                toast.success('Resource added')
            }
            setShowForm(false)
            setEditing(null)
            await loadResources()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to save resource')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (r: TrainingResource) => {
        if (!confirm(`Remove "${r.title}" from training resources?`)) return
        try {
            await trainingResourceService.remove(r._id)
            toast.success('Resource removed')
            setResources(prev => prev.filter(x => x._id !== r._id))
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to remove resource')
        }
    }

    if (!isAuthenticated) return null

    const featured = resources.filter(r => r.featured)
    const others = resources.filter(r => !r.featured)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Training Resources</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Curated learning material — articles, videos, internal docs, and external courses.
                        </p>
                    </div>
                    {canManage && (
                        <button
                            onClick={() => { setEditing(null); setShowForm(true) }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Resource
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Personal Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Available"
                        value={String(stats?.totalResources ?? resources.length)}
                        icon={Layers}
                        from="from-blue-500 to-blue-600"
                        bg="from-blue-50 to-blue-100"
                    />
                    <StatCard
                        label="Opened by you"
                        value={String(stats?.viewedResources ?? 0)}
                        icon={BookOpen}
                        from="from-emerald-500 to-emerald-600"
                        bg="from-emerald-50 to-emerald-100"
                    />
                    <StatCard
                        label="Total time"
                        value={`${stats?.totalHours ?? 0}h`}
                        icon={Clock}
                        from="from-amber-500 to-amber-600"
                        bg="from-amber-50 to-amber-100"
                    />
                    <StatCard
                        label="Day streak"
                        value={String(stats?.currentStreak ?? 0)}
                        icon={Flame}
                        from="from-rose-500 to-rose-600"
                        bg="from-rose-50 to-rose-100"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search title, description, or tags..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value as any)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All categories</option>
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value as any)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All types</option>
                            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        {(search || category || type) && (
                            <button
                                onClick={() => { setSearch(''); setCategory(''); setType('') }}
                                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Recent activity */}
                {stats && stats.recentViews.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            Recently opened
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {stats.recentViews.filter(rv => rv.resource).map((rv, i) => (
                                <div key={`${rv.resource?.id}-${i}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900 truncate">{rv.resource?.title}</p>
                                        <p className="text-xs text-gray-500">{new Date(rv.openedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : resources.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No resources found</h3>
                        <p className="text-sm text-gray-500">
                            {search || category || type
                                ? 'Try adjusting your filters.'
                                : canManage
                                    ? 'Add the first training resource to get started.'
                                    : 'No training material has been added yet.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {featured.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    Featured
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {featured.map(r => (
                                        <ResourceCard
                                            key={r._id}
                                            resource={r}
                                            onOpen={handleOpen}
                                            onEdit={canManage ? () => { setEditing(r); setShowForm(true) } : undefined}
                                            onDelete={canManage ? () => handleDelete(r) : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {others.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 mb-3">All resources</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {others.map(r => (
                                        <ResourceCard
                                            key={r._id}
                                            resource={r}
                                            onOpen={handleOpen}
                                            onEdit={canManage ? () => { setEditing(r); setShowForm(true) } : undefined}
                                            onDelete={canManage ? () => handleDelete(r) : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showForm && (
                <ResourceFormDrawer
                    initial={editing}
                    submitting={submitting}
                    onClose={() => { setShowForm(false); setEditing(null) }}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    )
}

function StatCard({ label, value, icon: Icon, from, bg }: { label: string; value: string; icon: any; from: string; bg: string }) {
    return (
        <div className={`rounded-xl bg-gradient-to-br ${bg} p-4 border-0`}>
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${from} shadow-md flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-gray-600 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    )
}

function ResourceCard({
    resource: r,
    onOpen,
    onEdit,
    onDelete,
}: {
    resource: TrainingResource
    onOpen: (r: TrainingResource) => void
    onEdit?: () => void
    onDelete?: () => void
}) {
    const Icon = TYPE_ICON[r.type] || Globe
    const colorCls = TYPE_COLOR[r.type] || 'bg-gray-100 text-gray-700'
    const categoryLabel = CATEGORIES.find(c => c.value === r.category)?.label || r.category

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 leading-snug">{r.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {categoryLabel}
                        {r.estimatedMinutes > 0 && (
                            <>
                                <span className="mx-1.5">·</span>
                                <span className="inline-flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    {r.estimatedMinutes} min
                                </span>
                            </>
                        )}
                    </p>
                </div>
                {r.featured && (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                )}
            </div>

            <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1">
                {r.description}
            </p>

            {r.tags && r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {r.tags.slice(0, 4).map((t, i) => (
                        <span key={`${t}-${i}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {t}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                <button
                    onClick={() => onOpen(r)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Open
                </button>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        title="Edit"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        title="Remove"
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {(r.viewCount > 0 || r.addedByName) && (
                <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                    {r.addedByName && <span>by {r.addedByName}</span>}
                    {r.viewCount > 0 && <span>{r.viewCount} view{r.viewCount === 1 ? '' : 's'}</span>}
                </div>
            )}
        </div>
    )
}

function ResourceFormDrawer({
    initial,
    submitting,
    onClose,
    onSubmit,
}: {
    initial: TrainingResource | null
    submitting: boolean
    onClose: () => void
    onSubmit: (input: SaveResourceInput) => void
}) {
    const [form, setForm] = useState<SaveResourceInput>({
        title: initial?.title || '',
        description: initial?.description || '',
        url: initial?.url || '',
        type: initial?.type || 'link',
        category: initial?.category || 'other',
        tags: initial?.tags || [],
        estimatedMinutes: initial?.estimatedMinutes || 0,
        featured: initial?.featured || false,
    })
    const [tagInput, setTagInput] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (f: SaveResourceInput) => {
        const e: Record<string, string> = {}
        if (!f.title || f.title.trim().length < 3) e.title = 'Title must be at least 3 characters'
        if (f.title && f.title.length > 200) e.title = 'Title cannot exceed 200 characters'
        if (!f.description || f.description.trim().length < 10) e.description = 'Description must be at least 10 characters'
        if (f.description && f.description.length > 2000) e.description = 'Description cannot exceed 2000 characters'
        if (!f.url) e.url = 'URL is required'
        else if (!URL_REGEX.test(f.url)) e.url = 'URL must start with http:// or https://'
        if ((f.estimatedMinutes ?? 0) < 0) e.estimatedMinutes = 'Cannot be negative'
        return e
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const v = validate(form)
        setErrors(v)
        if (Object.keys(v).length > 0) return
        onSubmit({
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            url: form.url.trim(),
            tags: form.tags?.map(t => t.trim()).filter(Boolean) || [],
        })
    }

    const addTag = () => {
        const t = tagInput.trim()
        if (!t) return
        if ((form.tags || []).includes(t)) { setTagInput(''); return }
        setForm({ ...form, tags: [...(form.tags || []), t] })
        setTagInput('')
    }

    const removeTag = (t: string) => {
        setForm({ ...form, tags: (form.tags || []).filter(x => x !== t) })
    }

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold text-gray-900">
                        {initial ? 'Edit Resource' : 'Add Resource'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <Field label="Title *" error={errors.title}>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className={inputCls(errors.title)}
                            placeholder="e.g. Customer Service Excellence"
                        />
                    </Field>

                    <Field label="Description *" error={errors.description}>
                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className={inputCls(errors.description) + ' resize-none'}
                            placeholder="What will the reader learn from this?"
                        />
                    </Field>

                    <Field label="URL *" error={errors.url} hint="Must start with http:// or https://">
                        <input
                            type="url"
                            value={form.url}
                            onChange={e => setForm({ ...form, url: e.target.value })}
                            className={inputCls(errors.url)}
                            placeholder="https://docs.google.com/..."
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type">
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value as ResourceType })}
                                className={inputCls()}
                            >
                                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Category">
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value as ResourceCategory })}
                                className={inputCls()}
                            >
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </Field>
                    </div>

                    <Field label="Estimated minutes" error={errors.estimatedMinutes}>
                        <input
                            type="number"
                            min={0}
                            value={form.estimatedMinutes ?? 0}
                            onChange={e => setForm({ ...form, estimatedMinutes: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                            className={inputCls(errors.estimatedMinutes)}
                            placeholder="0"
                        />
                    </Field>

                    <Field label="Tags">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                                    placeholder="Type a tag and press Enter"
                                    className={inputCls()}
                                />
                                <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Add</button>
                            </div>
                            {(form.tags || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {(form.tags || []).map((t, i) => (
                                        <span key={`${t}-${i}`} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                            {t}
                                            <button type="button" onClick={() => removeTag(t)} className="hover:text-blue-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Field>

                    <label className="flex items-center gap-2 select-none cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.featured ?? false}
                            onChange={e => setForm({ ...form, featured: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Mark as featured</span>
                    </label>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {initial ? 'Save changes' : 'Add resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error ? (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            ) : hint ? (
                <p className="mt-1 text-xs text-gray-500">{hint}</p>
            ) : null}
        </div>
    )
}

function inputCls(err?: string) {
    return `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-500' : 'border-gray-300'}`
}
