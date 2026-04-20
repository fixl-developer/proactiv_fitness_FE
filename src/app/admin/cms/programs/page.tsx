'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function ProgramLevelsPage() {
    return (
        <CMSCrudTable
            title="Program Levels"
            description="Manage gymnastics program levels shown on the School Gymnastics page."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true, minLength: 10, maxLength: 1000 },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'ageGroup', label: 'Age Group', type: 'text', required: true, maxLength: 40, showInTable: true },
                { name: 'duration', label: 'Duration', type: 'text', required: true, maxLength: 40, showInTable: true },
                { name: 'classSize', label: 'Class Size', type: 'text', required: true, maxLength: 40, placeholder: '1:6 ratio' },
                { name: 'price', label: 'Price', type: 'text', required: true, maxLength: 60, showInTable: true },
                { name: 'objectives', label: 'Learning Objectives', type: 'array' },
                { name: 'color', label: 'Color', type: 'text' },
                { name: 'icon', label: 'Icon', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999 },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.programLevels}
            tableColumns={['name', 'ageGroup', 'duration', 'price']}
        />
    )
}
