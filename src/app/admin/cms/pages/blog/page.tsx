'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function BlogCMSPage() {
    return (
        <PageContentEditor
            slug="blog"
            displayName="Blog"
            publicHref="/blog"
            subCollectionHint={{
                label: 'Blog Posts',
                href: '/admin/cms/blog',
                description: 'Individual blog articles are managed in Blog Posts.',
            }}
        />
    )
}
