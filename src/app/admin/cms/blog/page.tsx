'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function BlogPostsPage() {
    return (
        <CMSCrudTable
            title="Blog Posts"
            description="Create and manage blog articles for the website."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true },
                { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'my-blog-post' },
                { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
                { name: 'content', label: 'Content', type: 'richtext', required: true },
                { name: 'author', label: 'Author', type: 'text', required: true },
                { name: 'authorImage', label: 'Author Image', type: 'image' },
                { name: 'date', label: 'Date', type: 'text', placeholder: '2024-01-15' },
                { name: 'category', label: 'Category', type: 'text', required: true },
                { name: 'tags', label: 'Tags', type: 'array' },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'readTime', label: 'Read Time', type: 'text', placeholder: '5 min read' },
                { name: 'isFeatured', label: 'Featured', type: 'boolean' },
                { name: 'isPublished', label: 'Published', type: 'boolean' },
            ]}
            service={CMSAdminService.blogPosts}
            tableColumns={['title', 'author', 'category', 'isPublished', 'isFeatured']}
        />
    )
}
