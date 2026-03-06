'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';
import type { Franchise } from '@/types/enterprise';

interface ContractManagementProps {
    franchise: Franchise;
    onRenew: () => void;
}

export default function ContractManagement({ franchise, onRenew }: ContractManagementProps) {
    const startDate = new Date(franchise.contractStartDate);
    const endDate = new Date(franchise.contractEndDate);
    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysRemaining <= 90 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Contract Management
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Contract Period</span>
                        </div>
                        <p className="text-lg font-bold">
                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Status</span>
                        </div>
                        {isExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                        ) : isExpiringSoon ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Expiring in {daysRemaining} days
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Active ({daysRemaining} days remaining)
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Contract Details</h3>
                    <div className="grid gap-2 text-sm">
                        <div className="flex justify-between p-2 border rounded">
                            <span className="text-muted-foreground">Business License</span>
                            <span className="font-medium">{franchise.businessLicense}</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                            <span className="text-muted-foreground">Tax ID</span>
                            <span className="font-medium">{franchise.taxId}</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                            <span className="text-muted-foreground">Royalty Rate</span>
                            <span className="font-medium">{franchise.royaltyRate}%</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                            <span className="text-muted-foreground">Revenue Share</span>
                            <span className="font-medium">{franchise.revenueShareRate}%</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                            <span className="text-muted-foreground">Monthly Fee</span>
                            <span className="font-medium">
                                AED {franchise.monthlyFee.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Contract
                    </Button>
                    {(isExpiringSoon || isExpired) && (
                        <Button onClick={onRenew} className="flex-1">
                            Renew Contract
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
