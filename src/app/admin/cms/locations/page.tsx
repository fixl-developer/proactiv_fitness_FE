'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function LocationDetailsPage() {
    return (
        <CMSCrudTable
            title="Location Details"
            description="Manage location pages - facilities, schedules, team members, and contact info for each location."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'slug', label: 'Slug', type: 'slug', required: true, placeholder: 'cyberport', maxLength: 80, showInTable: true, helpText: 'Lowercase letters, numbers and hyphens only. Must be unique.' },
                { name: 'address', label: 'Address', type: 'textarea', required: true, minLength: 5, maxLength: 500, showInTable: true },
                { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+971 4 123 4567' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'location@example.com' },
                { name: 'mapUrl', label: 'Map URL', type: 'url', placeholder: 'https://maps.google.com/...' },
                { name: 'images', label: 'Images', type: 'array', helpText: 'Add image URLs one per row' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.locationDetails}
            tableColumns={['name', 'slug', 'address']}
        />
    )
}
