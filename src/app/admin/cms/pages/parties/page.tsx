'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function PartiesCMSPage() {
    return (
        <PageContentEditor
            slug="parties"
            displayName="Parties"
            publicHref="/birthday-parties"
            subCollectionHint={{
                label: 'Party Packages',
                href: '/admin/cms/party-packages',
                description: 'Birthday party packages and pricing are managed in Party Packages.',
            }}
        />
    )
}
