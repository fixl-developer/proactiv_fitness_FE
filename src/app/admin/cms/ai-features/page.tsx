'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function AIFeaturesPage() {
    return (
        <CMSCrudTable
            title="AI Features"
            description="Manage the AI feature cards displayed on the landing page. Configure titles, descriptions, and icons."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true },
                { name: 'icon', label: 'Icon', type: 'text', required: true, placeholder: 'e.g. MessageSquare, Target, Shield', showInTable: true },
                { name: 'color', label: 'Color', type: 'text' },
                { name: 'bgColor', label: 'Background Color', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number', showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.aiFeatures}
            tableColumns={['title', 'icon', 'order']}
        />
    )
}
