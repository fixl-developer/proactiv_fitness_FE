'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function FAQsPage() {
    return (
        <CMSCrudTable
            title="FAQs"
            description="Manage frequently asked questions organized by category."
            fields={[
                { name: 'question', label: 'Question', type: 'text', required: true, minLength: 5, maxLength: 300, showInTable: true },
                { name: 'answer', label: 'Answer', type: 'textarea', required: true, minLength: 5, maxLength: 2000 },
                { name: 'category', label: 'Category', type: 'select', required: true, showInTable: true, options: [
                    { label: 'General', value: 'general' },
                    { label: 'Classes', value: 'classes' },
                    { label: 'Assessments', value: 'assessments' },
                    { label: 'Camps', value: 'camps' },
                    { label: 'Programs', value: 'programs' },
                    { label: 'Birthday Parties', value: 'birthday-parties' },
                ] },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999, showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.faqItems}
            tableColumns={['question', 'category', 'order']}
        />
    )
}
