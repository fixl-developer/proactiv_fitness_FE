'use client'
import PageContentEditor from '@/components/admin/cms/PageContentEditor'

export default function TermsCMSPage() {
    return (
        <PageContentEditor
            slug="terms"
            displayName="Terms & Conditions"
            publicHref="/terms"
        />
    )
}
