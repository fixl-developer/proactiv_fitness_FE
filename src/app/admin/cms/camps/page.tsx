'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function CampProgramsPage() {
    return (
        <CMSCrudTable
            title="Camp Programs"
            description="Manage holiday camp programs and activities."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true, minLength: 10, maxLength: 1000 },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'dates', label: 'Dates', type: 'text', required: true, placeholder: 'Jul 1 - Jul 15, 2026', maxLength: 80, showInTable: true },
                { name: 'price', label: 'Price', type: 'text', required: true, maxLength: 60, showInTable: true },
                { name: 'ageGroup', label: 'Age Group', type: 'text', required: true, maxLength: 40, showInTable: true },
                { name: 'activities', label: 'Activities', type: 'array' },
                { name: 'features', label: 'Features', type: 'array' },
                { name: 'location', label: 'Location', type: 'text', maxLength: 120 },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999 },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.campPrograms}
            tableColumns={['title', 'dates', 'price', 'ageGroup']}
        />
    )
}
