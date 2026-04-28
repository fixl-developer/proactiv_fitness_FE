'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function CareersCMSPage() {
    return (
        <PageContentEditor
            slug="careers"
            displayName="Careers"
            publicHref="/careers"
            subCollectionHint={{
                label: 'Job Positions',
                href: '/admin/cms/careers',
                description: 'Open job listings are managed in Job Positions.',
            }}
        />
    )
}
