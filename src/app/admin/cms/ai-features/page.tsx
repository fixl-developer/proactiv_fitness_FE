'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function AIFeaturesPage() {
    return (
        <CMSCrudTable
            title="AI Features"
            description="Manage the AI feature cards displayed on the landing page. Configure titles, descriptions, and icons."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true, minLength: 10, maxLength: 500 },
                { name: 'icon', label: 'Icon', type: 'text', required: true, maxLength: 40, placeholder: 'e.g. MessageSquare, Target, Shield', showInTable: true },
                { name: 'color', label: 'Color', type: 'text', maxLength: 40 },
                { name: 'bgColor', label: 'Background Color', type: 'text', maxLength: 40 },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999, showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.aiFeatures}
            tableColumns={['title', 'icon', 'order']}
        />
    )
}
