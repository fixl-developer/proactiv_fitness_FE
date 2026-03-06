'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit, Eye } from 'lucide-react';
import type { Franchise } from '@/types/enterprise';
import { useRouter } from 'next/navigation';

interface FranchiseListProps {
    franchises: Franchise[];
    onEdit: (franchise: Franchise) => void;
}

export default function FranchiseList({ franchises, onEdit }: FranchiseListProps) {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Franchises ({franchises.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {franchises.map((franchise) => (
                        <div
                            key={franchise.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{franchise.name}</h3>
                                    <Badge variant="outline">{franchise.code}</Badge>
                                    <Badge className={getStatusColor(franchise.status)}>
                                        {franchise.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <div>
                                        <span className="font-medium">Owner:</span> {franchise.owner}
                                    </div>
                                    <div>
                                        <span className="font-medium">Location:</span>{' '}
                                        {franchise.city}, {franchise.country}
                                    </div>
                                    <div>
                                        <span className="font-medium">Royalty:</span>{' '}
                                        {franchise.royaltyRate}%
                                    </div>
                                    <div>
                                        <span className="font-medium">Contract:</span>{' '}
                                        {new Date(franchise.contractStartDate).toLocaleDateString()} -{' '}
                                        {new Date(franchise.contractEndDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/franchise/${franchise.id}`)}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(franchise)}
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
