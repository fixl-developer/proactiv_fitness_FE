'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Edit } from 'lucide-react';
import type { Partner } from '@/types/enterprise';
import { useRouter } from 'next/navigation';

interface PartnerListProps {
    partners: Partner[];
    onEdit: (partner: Partner) => void;
}

export default function PartnerList({ partners, onEdit }: PartnerListProps) {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'school':
                return 'bg-blue-100 text-blue-800';
            case 'government':
                return 'bg-purple-100 text-purple-800';
            case 'corporate':
                return 'bg-orange-100 text-orange-800';
            case 'ngo':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Partners ({partners.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{partner.name}</h3>
                                    <Badge className={getTypeColor(partner.type)}>
                                        {partner.type}
                                    </Badge>
                                    <Badge className={getStatusColor(partner.status)}>
                                        {partner.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <div>
                                        <span className="font-medium">Contact:</span>{' '}
                                        {partner.contactPerson}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email:</span> {partner.email}
                                    </div>
                                    <div>
                                        <span className="font-medium">Revenue Share:</span>{' '}
                                        {partner.revenueShareRate}%
                                    </div>
                                    <div>
                                        <span className="font-medium">Contract:</span>{' '}
                                        {new Date(partner.startDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/partners/${partner.id}`)}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(partner)}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
