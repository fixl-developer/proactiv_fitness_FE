'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function WanChaiCMSPage() {
    return (
        <PageContentEditor
            slug="wan-chai"
            displayName="Wan Chai"
            publicHref="/locations/wan-chai"
            subCollectionHint={{
                label: 'Location Details',
                href: '/admin/cms/locations',
                description: 'Facilities, schedules, and team for the Wan Chai location are managed in Location Details.',
            }}
        />
    )
}
