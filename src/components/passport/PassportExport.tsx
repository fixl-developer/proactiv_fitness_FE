'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PassportExportProps {
    studentId: string;
    studentName: string;
}

export default function PassportExport({ studentId, studentName }: PassportExportProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleExportPDF = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/passport/${studentId}/export`, {
                method: 'GET',
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${studentName}-passport.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: 'Success',
                description: 'Passport exported successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to export passport',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/passport/view/${studentId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${studentName}'s Digital Athlete Passport`,
                    text: 'Check out my athletic achievements!',
                    url: shareUrl,
                });
            } catch (error) {
                // User cancelled share
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({
                title: 'Link Copied',
                description: 'Passport link copied to clipboard',
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Export & Share
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    className="w-full"
                    onClick={handleExportPDF}
                    disabled={loading}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Exporting...' : 'Download Transcript (PDF)'}
                </Button>
                <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleShare}
                >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Passport
                </Button>
            </CardContent>
        </Card>
    );
}
