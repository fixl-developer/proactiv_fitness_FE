'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function PartnersPage() {
    return (
        <CMSCrudTable
            title="Partners"
            description="Manage partner logos and branding displayed on the landing page."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, showInTable: true },
                { name: 'logo', label: 'Logo URL', type: 'image', required: true, showInTable: true },
                { name: 'fallbackText', label: 'Fallback Text', type: 'text' },
                { name: 'color', label: 'Color', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number', showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.partners}
            tableColumns={['name', 'logo', 'order']}
        />
    )
}
