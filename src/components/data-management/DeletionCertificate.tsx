'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Download, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface DeletionCertificateProps {
    requestId: string;
    completedAt: string;
    entities: string[];
    type: 'soft' | 'hard';
}

export default function DeletionCertificate({
    requestId,
    completedAt,
    entities,
    type,
}: DeletionCertificateProps) {
    const handleDownload = () => {
        // Download certificate logic
        console.log('Downloading certificate...');
    };

    return (
        <Card className="border-2 border-primary">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <CardTitle>Data Deletion Certificate</CardTitle>
                </div>
                <CardDescription>
                    Official certificate of data deletion compliance
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg space-y-4">
                    <div className="flex items-center justify-center mb-4">
                        <FileCheck className="h-16 w-16 text-primary" />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold">Certificate of Data Deletion</h3>
                        <p className="text-sm text-muted-foreground">
                            This certifies that the following data has been permanently deleted from
                            our systems
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Request ID:</span>
                            <span className="text-sm font-mono">{requestId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Deletion Type:</span>
                            <Badge variant={type === 'hard' ? 'destructive' : 'secondary'}>
                                {type === 'hard' ? 'Permanent' : 'Anonymized'}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Completed:</span>
                            <span className="text-sm">
                                {format(new Date(completedAt), 'MMMM dd, yyyy HH:mm')}
                            </span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-medium">Entities:</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                                {entities.map((entity) => (
                                    <Badge key={entity} variant="outline" className="text-xs">
                                        {entity}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t text-center">
                        <p className="text-xs text-muted-foreground">
                            This certificate is issued in compliance with GDPR Article 17 (Right to
                            Erasure)
                        </p>
                    </div>
                </div>

                <Button onClick={handleDownload} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate (PDF)
                </Button>
            </CardContent>
        </Card>
    );
}
