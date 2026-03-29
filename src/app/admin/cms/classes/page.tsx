'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function ClassSessionsPage() {
    return (
        <CMSCrudTable
            title="Class Sessions"
            description="Manage class listings that appear on the Book Assessment page. These are the paid classes users can book."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true },
                { name: 'image', label: 'Image', type: 'image', required: true, showInTable: true },
                { name: 'time', label: 'Time', type: 'text', required: true, placeholder: '10:30 am', showInTable: true },
                { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: '1:00 pm' },
                { name: 'days', label: 'Days', type: 'text', required: true, placeholder: 'Mo, We, Fr' },
                { name: 'ageGroup', label: 'Age Group', type: 'text', required: true, placeholder: '3 - 16 years', showInTable: true },
                { name: 'level', label: 'Level', type: 'select', required: true, options: [
                    { label: 'Beginner', value: 'BEGINNER' },
                    { label: 'Intermediate', value: 'INTERMEDIATE' },
                    { label: 'Advanced', value: 'ADVANCED' },
                ] },
                { name: 'price', label: 'Price', type: 'text', placeholder: 'FREE', showInTable: true },
                { name: 'isFree', label: 'Is Free', type: 'boolean' },
                { name: 'availableSlots', label: 'Available Slots', type: 'number', required: true, showInTable: true },
                { name: 'totalSlots', label: 'Total Slots', type: 'number', required: true },
                { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Assessment' },
                { name: 'location', label: 'Location', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.classSessions}
            tableColumns={['title', 'image', 'time', 'price', 'ageGroup', 'availableSlots']}
        />
    )
}
