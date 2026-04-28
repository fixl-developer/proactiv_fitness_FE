'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import CMSCrudTable, { FieldConfig } from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

// Header Navigation admin page.
// The "Parent Label" picker is dynamic — populated from existing top-level
// items (parentLabel === '') so admins can attach new entries to a real parent
// without typing the exact spelling. Refreshes after every create/update/delete
// so a brand-new top-level item is immediately selectable as a parent.
export default function HeaderNavigationAdminPage() {
    const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([])

    const loadParentOptions = useCallback(async () => {
        try {
            const res: any = await CMSAdminService.navMenuItems.getAll({ limit: 200 })
            const data = res?.data ?? res
            const items: any[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
            const topLevel = items
                .filter((it: any) => !it?.parentLabel || it.parentLabel === '')
                .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
            setParentOptions(topLevel.map((it: any) => ({ label: it.label, value: it.label })))
        } catch {
            // Drop silently — admin can still type parent label via fallback ('' = top-level)
            setParentOptions([])
        }
    }, [])

    useEffect(() => { loadParentOptions() }, [loadParentOptions])

    // Wrap the underlying service so the parent dropdown refreshes whenever
    // the admin mutates the list — otherwise a freshly-added top-level item
    // wouldn't show as a parent option until the page is reloaded.
    const wrappedService = useMemo(() => ({
        getAll: (params?: any) => CMSAdminService.navMenuItems.getAll(params),
        getById: (id: string) => CMSAdminService.navMenuItems.getById(id),
        create: async (data: any) => {
            const r = await CMSAdminService.navMenuItems.create(data)
            loadParentOptions()
            return r
        },
        update: async (id: string, data: any) => {
            const r = await CMSAdminService.navMenuItems.update(id, data)
            loadParentOptions()
            return r
        },
        delete: async (id: string) => {
            const r = await CMSAdminService.navMenuItems.delete(id)
            loadParentOptions()
            return r
        },
    }), [loadParentOptions])

    const fields: FieldConfig[] = useMemo(() => ([
        {
            name: 'label',
            label: 'Label',
            type: 'text',
            required: true,
            minLength: 1,
            maxLength: 25,
            showInTable: true,
            placeholder: 'e.g., Home, About, Services',
        },
        {
            name: 'href',
            label: 'URL',
            type: 'url',
            required: true,
            maxLength: 200,
            showInTable: true,
            placeholder: '/locations/cyberport or # for dropdown parents',
            helpText: 'Use # for items that act as a dropdown parent (no direct page).',
        },
        {
            name: 'parentLabel',
            label: 'Parent Label',
            type: 'select',
            showInTable: true,
            options: parentOptions,
            helpText: parentOptions.length === 0
                ? 'No top-level items yet. Leave blank for now — this item will be top-level.'
                : 'Pick the dropdown parent for this item. Leave blank to make it a top-level menu item.',
        },
        {
            name: 'order',
            label: 'Display Order',
            type: 'number',
            min: 0,
            max: 999,
            showInTable: true,
            helpText: 'Lower numbers show first. Used within each level (top-level / per dropdown).',
        },
        {
            name: 'icon',
            label: 'Icon (optional)',
            type: 'text',
            maxLength: 40,
            placeholder: 'lucide icon name (optional)',
        },
        { name: 'isActive', label: 'Active', type: 'boolean', showInTable: true },
    ]), [parentOptions])

    return (
        <CMSCrudTable
            title="Header Navigation"
            description="Manage the items shown in the public website's top navigation. Top-level items (no parent) appear in the main bar; items with a parent appear inside that parent's dropdown."
            fields={fields}
            service={wrappedService}
            tableColumns={['label', 'href', 'parentLabel', 'order', 'isActive']}
        />
    )
}
