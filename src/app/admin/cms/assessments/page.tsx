'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function AssessmentsPage() {
    return (
        <CMSCrudTable
            title="Assessments"
            description="Manage assessment listings that appear on the Book Assessment page. These are the FREE assessments users can book."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true, minLength: 10, maxLength: 1000 },
                { name: 'image', label: 'Image', type: 'image', required: true, showInTable: true },
                { name: 'time', label: 'Time', type: 'text', required: true, placeholder: '10:30 am', showInTable: true },
                { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: '1 hour' },
                { name: 'days', label: 'Days', type: 'text', required: true, placeholder: 'Mo, We, Fr' },
                { name: 'ageGroup', label: 'Age Group', type: 'text', required: true, placeholder: '3 - 16 years', showInTable: true },
                { name: 'level', label: 'Level', type: 'select', required: true, options: [
                    { label: 'Beginner', value: 'BEGINNER' },
                    { label: 'Intermediate', value: 'INTERMEDIATE' },
                    { label: 'Advanced', value: 'ADVANCED' },
                ], showInTable: true },
                { name: 'price', label: 'Price', type: 'text', placeholder: 'FREE' },
                { name: 'isFree', label: 'Is Free', type: 'boolean' },
                { name: 'availableSlots', label: 'Available Slots', type: 'number', required: true, min: 0, max: 10000, showInTable: true },
                { name: 'totalSlots', label: 'Total Slots', type: 'number', required: true, min: 1, max: 10000 },
                { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Assessment', maxLength: 80 },
                { name: 'location', label: 'Location', type: 'text', maxLength: 120 },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999 },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.assessments}
            tableColumns={['title', 'image', 'time', 'ageGroup', 'level', 'availableSlots']}
        />
    )
}
