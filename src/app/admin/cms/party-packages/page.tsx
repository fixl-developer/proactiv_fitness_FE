'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function PartyPackagesPage() {
    return (
        <CMSCrudTable
            title="Party Packages"
            description="Manage birthday party packages shown on the Birthday Parties page."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: '1.5 hours', maxLength: 40, showInTable: true },
                { name: 'maxKids', label: 'Max Kids', type: 'number', required: true, min: 1, max: 500, showInTable: true },
                { name: 'coaches', label: 'Coaches', type: 'number', required: true, min: 1, max: 50 },
                { name: 'partyRoomTime', label: 'Party Room Time', type: 'text', maxLength: 60 },
                { name: 'features', label: 'Features', type: 'array', helpText: 'What is included in the package' },
                { name: 'notIncluded', label: 'Not Included', type: 'array', helpText: 'What is not included' },
                { name: 'price', label: 'Price', type: 'text', placeholder: 'AED 2500 or Contact for Pricing', maxLength: 60, showInTable: true },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999 },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.partyPackages}
            tableColumns={['name', 'duration', 'maxKids', 'price']}
        />
    )
}
