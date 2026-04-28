'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function AboutCMSPage() {
    return (
        <PageContentEditor
            slug="about"
            displayName="About"
            publicHref="/about"
            subCollectionHint={{
                label: 'About Page Content',
                href: '/admin/cms/about',
                description: 'Mission, vision, values and history are managed on the existing About Page editor.',
            }}
        />
    )
}
