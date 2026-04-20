'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function CareersPage() {
    return (
        <CMSCrudTable
            title="Job Positions"
            description="Manage career listings and job requirements for the Careers page."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'location', label: 'Location', type: 'text', required: true, maxLength: 120, showInTable: true },
                { name: 'type', label: 'Type', type: 'select', required: true, showInTable: true, options: [
                    { label: 'Full-time', value: 'Full-time' },
                    { label: 'Part-time', value: 'Part-time' },
                    { label: 'Seasonal', value: 'Seasonal' },
                    { label: 'Contract', value: 'Contract' },
                ] },
                { name: 'description', label: 'Description', type: 'textarea', minLength: 10, maxLength: 2000 },
                { name: 'requirements', label: 'Requirements', type: 'array' },
                { name: 'responsibilities', label: 'Responsibilities', type: 'array' },
                { name: 'benefits', label: 'Benefits', type: 'array' },
                { name: 'salary', label: 'Salary', type: 'text', maxLength: 80, placeholder: 'AED 5,000 - 8,000' },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999 },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.jobPositions}
            tableColumns={['title', 'location', 'type']}
        />
    )
}
