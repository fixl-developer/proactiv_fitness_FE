'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function MultiActivityCampsCMSPage() {
    return (
        <PageContentEditor
            slug="multi-activity-camps"
            displayName="Multi-Activity Camps"
            publicHref="/camps/multi-activity"
            subCollectionHint={{
                label: 'Camp Programs',
                href: '/admin/cms/camps',
                description: 'Individual camp sessions and dates are managed in Camp Programs.',
            }}
        />
    )
}
