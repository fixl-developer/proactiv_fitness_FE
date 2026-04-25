'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function BlogPostsPage() {
    return (
        <CMSCrudTable
            title="Blog Posts"
            description="Create and manage blog articles for the website."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, minLength: 3, maxLength: 200, showInTable: true },
                { name: 'slug', label: 'Slug', type: 'slug', required: true, placeholder: 'my-blog-post', maxLength: 200, deriveFrom: 'title', helpText: 'Auto-generated from title. Lowercase letters, numbers and hyphens only. Must be unique.' },
                { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true, minLength: 10, maxLength: 500 },
                { name: 'content', label: 'Content', type: 'richtext', required: true, minLength: 20 },
                { name: 'author', label: 'Author', type: 'text', required: true, minLength: 2, maxLength: 80, showInTable: true },
                { name: 'authorImage', label: 'Author Image', type: 'image' },
                { name: 'date', label: 'Date', type: 'text', placeholder: '2026-01-15', pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: 'Use YYYY-MM-DD format' },
                { name: 'category', label: 'Category', type: 'text', required: true, maxLength: 80, showInTable: true },
                { name: 'tags', label: 'Tags', type: 'array' },
                { name: 'image', label: 'Cover Image', type: 'image' },
                { name: 'readTime', label: 'Read Time', type: 'text', placeholder: '5 min read', maxLength: 30 },
                { name: 'isFeatured', label: 'Featured', type: 'boolean', showInTable: true },
                { name: 'isPublished', label: 'Published', type: 'boolean', showInTable: true },
            ]}
            service={CMSAdminService.blogPosts}
            tableColumns={['title', 'author', 'category', 'isPublished', 'isFeatured']}
        />
    )
}
