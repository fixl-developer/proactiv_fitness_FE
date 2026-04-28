'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function CyberportCMSPage() {
    return (
        <PageContentEditor
            slug="cyberport"
            displayName="Cyberport"
            publicHref="/locations/cyberport"
            subCollectionHint={{
                label: 'Location Details',
                href: '/admin/cms/locations',
                description: 'Facilities, schedules, and team for the Cyberport location are managed in Location Details.',
            }}
        />
    )
}
