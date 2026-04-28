'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function TeamMembersAdminPage() {
    return (
        <CMSCrudTable
            title="Team Members"
            description="Manage coach and staff profiles shown on the public Team page. Each member appears in the team carousel."
            fields={[
                { name: 'name', label: 'Name', type: 'name', required: true, minLength: 2, maxLength: 80, showInTable: true },
                { name: 'role', label: 'Role / Title', type: 'text', required: true, maxLength: 80, showInTable: true, placeholder: 'Head Coach, Senior Coach, etc.' },
                { name: 'image', label: 'Photo', type: 'image', helpText: 'Upload a profile photo', showInTable: true },
                { name: 'fallbackGradient', label: 'Fallback Gradient', type: 'gradient', gradientFormat: 'colors-only', helpText: 'Shown when no photo is uploaded. Pick a preset or use Advanced for custom Tailwind classes.' },
                { name: 'specialization', label: 'Specialization', type: 'text', maxLength: 200, placeholder: 'Elite Competitive Gymnastics' },
                { name: 'experience', label: 'Years of Experience', type: 'text', placeholder: '10+ years' },
                { name: 'bio', label: 'Biography', type: 'textarea', maxLength: 1000 },
                { name: 'qualifications', label: 'Qualifications', type: 'array', helpText: 'One qualification per line' },
                { name: 'location', label: 'Primary Location', type: 'text', placeholder: 'Cyberport / Wan Chai' },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999 },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.teamMembers}
            tableColumns={['name', 'role', 'order']}
        />
    )
}
