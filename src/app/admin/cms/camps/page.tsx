'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function CampProgramsPage() {
    return (
        <CMSCrudTable
            title="Camp Programs"
            description="Manage holiday camp programs and activities."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'dates', label: 'Dates', type: 'text', required: true, showInTable: true },
                { name: 'price', label: 'Price', type: 'text', required: true, showInTable: true },
                { name: 'ageGroup', label: 'Age Group', type: 'text', required: true, showInTable: true },
                { name: 'activities', label: 'Activities', type: 'array' },
                { name: 'features', label: 'Features', type: 'array' },
                { name: 'location', label: 'Location', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.campPrograms}
            tableColumns={['title', 'dates', 'price', 'ageGroup']}
        />
    )
}
