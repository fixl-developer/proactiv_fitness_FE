'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function SchoolGymnasticsCMSPage() {
    return (
        <PageContentEditor
            slug="school-gymnastics"
            displayName="School Gymnastics"
            publicHref="/school-gymnastics"
            subCollectionHint={{
                label: 'Program Levels',
                href: '/admin/cms/programs',
                description: 'Beginner / Intermediate / Advanced / Competitive levels are managed in Program Levels.',
            }}
        />
    )
}
