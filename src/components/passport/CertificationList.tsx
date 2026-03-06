'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, CheckCircle, AlertCircle } from 'lucide-react';
import type { Certification } from '@/types/passport';

interface CertificationListProps {
    certifications: Certification[];
    onDownload: (certificationId: string) => void;
}

export default function CertificationList({ certifications, onDownload }: CertificationListProps) {
    const isExpired = (expiryDate?: string) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const isExpiringSoon = (expiryDate?: string) => {
        if (!expiryDate) return false;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiry = new Date(expiryDate);
        return expiry < thirtyDaysFromNow && expiry > new Date();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications & Badges
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    {certifications.map((cert) => {
                        const expired = isExpired(cert.expiryDate);
                        const expiringSoon = isExpiringSoon(cert.expiryDate);

                        return (
                            <Card key={cert.id} className={expired ? 'opacity-50' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-purple-500" />
                                            <h3 className="font-semibold">{cert.name}</h3>
                                        </div>
                                        {cert.isVerified && (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-3">
                                        {cert.description}
                                    </p>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Issuer:</span>
                                            <span className="font-medium">{cert.issuer}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Issued:</span>
                                            <span className="font-medium">
                                                {new Date(cert.issueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {cert.expiryDate && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Expires:</span>
                                                <span
                                                    className={`font-medium ${expired
                                                            ? 'text-red-600'
                                                            : expiringSoon
                                                                ? 'text-orange-600'
                                                                : ''
                                                        }`}
                                                >
                                                    {new Date(cert.expiryDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {expired && (
                                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded mb-3">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-xs text-red-600">Expired</span>
                                        </div>
                                    )}

                                    {expiringSoon && !expired && (
                                        <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded mb-3">
                                            <AlertCircle className="h-4 w-4 text-orange-600" />
                                            <span className="text-xs text-orange-600">
                                                Expiring soon
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => onDownload(cert.id)}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>
                                        <Badge variant="secondary" className="text-xs">
                                            {cert.verificationCode}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
