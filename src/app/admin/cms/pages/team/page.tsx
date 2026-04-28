'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function TeamCMSPage() {
    return (
        <PageContentEditor
            slug="team"
            displayName="Team"
            publicHref="/team"
            subCollectionHint={{
                label: 'Team Members',
                href: '/admin/cms/team',
                description: 'Coach profiles (photos, bios, qualifications) are managed in Team Members.',
            }}
        />
    )
}
