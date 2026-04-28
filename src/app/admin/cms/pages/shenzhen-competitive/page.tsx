'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function ShenzhenCompetitiveCMSPage() {
    return (
        <PageContentEditor
            slug="shenzhen-competitive"
            displayName="Shenzhen Competitive"
            publicHref="/camps/shenzhen-competitive"
            subCollectionHint={{
                label: 'Camp Programs',
                href: '/admin/cms/camps',
                description: 'Individual camp sessions and dates are managed in Camp Programs.',
            }}
        />
    )
}
