'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function PartyPackagesPage() {
    return (
        <CMSCrudTable
            title="Party Packages"
            description="Manage birthday party packages shown on the Birthday Parties page."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, showInTable: true },
                { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: '1.5 hours', showInTable: true },
                { name: 'maxKids', label: 'Max Kids', type: 'number', required: true, showInTable: true },
                { name: 'coaches', label: 'Coaches', type: 'number', required: true },
                { name: 'partyRoomTime', label: 'Party Room Time', type: 'text' },
                { name: 'features', label: 'Features', type: 'array' },
                { name: 'notIncluded', label: 'Not Included', type: 'array' },
                { name: 'price', label: 'Price', type: 'text', placeholder: 'Contact for Pricing', showInTable: true },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'order', label: 'Display Order', type: 'number' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.partyPackages}
            tableColumns={['name', 'duration', 'maxKids', 'price']}
        />
    )
}
