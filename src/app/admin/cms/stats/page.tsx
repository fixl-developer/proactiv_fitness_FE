'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function StatsPage() {
    return (
        <CMSCrudTable
            title="Site Stats"
            description="Manage the statistics displayed on the landing page. Configure labels, values, and visual styling."
            fields={[
                { name: 'label', label: 'Label', type: 'text', required: true, showInTable: true },
                { name: 'value', label: 'Value', type: 'number', required: true, showInTable: true },
                { name: 'suffix', label: 'Suffix', type: 'text', showInTable: true },
                { name: 'icon', label: 'Icon', type: 'text' },
                { name: 'color', label: 'Color', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number', showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.siteStats}
            tableColumns={['label', 'value', 'suffix', 'order']}
        />
    )
}
