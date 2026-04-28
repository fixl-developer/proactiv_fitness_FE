'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function GymnasticsCampsCMSPage() {
    return (
        <PageContentEditor
            slug="gymnastics-camps"
            displayName="Gymnastics Camps"
            publicHref="/camps/gymnastics"
            subCollectionHint={{
                label: 'Camp Programs',
                href: '/admin/cms/camps',
                description: 'Individual camp sessions and dates are managed in Camp Programs.',
            }}
        />
    )
}
