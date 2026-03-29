'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function LocationDetailsPage() {
    return (
        <CMSCrudTable
            title="Location Details"
            description="Manage location pages - facilities, schedules, team members, and contact info for each location."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, showInTable: true },
                { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'cyberport', showInTable: true },
                { name: 'address', label: 'Address', type: 'textarea', required: true, showInTable: true },
                { name: 'phone', label: 'Phone', type: 'text' },
                { name: 'email', label: 'Email', type: 'text' },
                { name: 'mapUrl', label: 'Map URL', type: 'text' },
                { name: 'images', label: 'Images', type: 'array' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.locationDetails}
            tableColumns={['name', 'slug', 'address']}
        />
    )
}
