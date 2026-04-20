'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function PartnersPage() {
    return (
        <CMSCrudTable
            title="Partners"
            description="Manage partner logos and branding displayed on the landing page."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, minLength: 2, maxLength: 80, showInTable: true },
                { name: 'logo', label: 'Logo', type: 'image', required: true, showInTable: true },
                { name: 'fallbackText', label: 'Fallback Text', type: 'text', maxLength: 40, helpText: 'Shown if logo fails to load' },
                { name: 'color', label: 'Color', type: 'text', maxLength: 40 },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999, showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.partners}
            tableColumns={['name', 'logo', 'order']}
        />
    )
}
