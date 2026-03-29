'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function ProgramLevelsPage() {
    return (
        <CMSCrudTable
            title="Program Levels"
            description="Manage gymnastics program levels shown on the School Gymnastics page."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'ageGroup', label: 'Age Group', type: 'text', required: true, showInTable: true },
                { name: 'duration', label: 'Duration', type: 'text', required: true, showInTable: true },
                { name: 'classSize', label: 'Class Size', type: 'text', required: true },
                { name: 'price', label: 'Price', type: 'text', required: true, showInTable: true },
                { name: 'objectives', label: 'Objectives', type: 'array' },
                { name: 'color', label: 'Color', type: 'text' },
                { name: 'icon', label: 'Icon', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.programLevels}
            tableColumns={['name', 'ageGroup', 'duration', 'price']}
        />
    )
}
