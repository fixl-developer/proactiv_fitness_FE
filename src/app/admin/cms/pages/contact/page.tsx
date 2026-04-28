'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function ContactCMSPage() {
    return (
        <PageContentEditor
            slug="contact"
            displayName="Contact Us"
            publicHref="/contact"
            subCollectionHint={{
                label: 'Contact Info',
                href: '/admin/cms/contact',
                description: 'Phone, email, address, hours and social links are managed in Contact Info.',
            }}
        />
    )
}
