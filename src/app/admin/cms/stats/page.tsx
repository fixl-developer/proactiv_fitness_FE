'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function StatsPage() {
    return (
        <CMSCrudTable
            title="Site Stats"
            description="Manage the statistics displayed on the landing page. Configure labels, values, and visual styling."
            fields={[
                { name: 'label', label: 'Label', type: 'text', required: true, minLength: 2, maxLength: 80, showInTable: true },
                { name: 'value', label: 'Value', type: 'number', required: true, min: 0, max: 999999, showInTable: true },
                { name: 'suffix', label: 'Suffix', type: 'text', maxLength: 10, placeholder: '+ or %', showInTable: true },
                { name: 'icon', label: 'Icon', type: 'text', maxLength: 40, placeholder: 'e.g. Users, Trophy' },
                { name: 'color', label: 'Color', type: 'text', maxLength: 40 },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999, showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.siteStats}
            tableColumns={['label', 'value', 'suffix', 'order']}
        />
    )
}
