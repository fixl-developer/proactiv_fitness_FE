'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function FAQsPage() {
    return (
        <CMSCrudTable
            title="FAQs"
            description="Manage frequently asked questions organized by category."
            fields={[
                { name: 'question', label: 'Question', type: 'text', required: true },
                { name: 'answer', label: 'Answer', type: 'textarea', required: true },
                { name: 'category', label: 'Category', type: 'select', required: true, options: [
                    { label: 'Birthday Parties', value: 'birthday-parties' },
                    { label: 'General', value: 'general' },
                    { label: 'Classes', value: 'classes' },
                    { label: 'Assessments', value: 'assessments' },
                    { label: 'Camps', value: 'camps' },
                    { label: 'Programs', value: 'programs' },
                ]},
                { name: 'order', label: 'Display Order', type: 'number' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.faqItems}
            tableColumns={['question', 'category', 'order']}
        />
    )
}
