'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { verifyCertification } from '@/lib/api/passport';
import type { Certification } from '@/types/passport';
import { useToast } from '@/hooks/use-toast';

export default function CertificationVerification() {
    const { toast } = useToast();
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Certification | null>(null);
    const [verified, setVerified] = useState<boolean | null>(null);

    const handleVerify = async () => {
        if (!verificationCode.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a verification code',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setResult(null);
        setVerified(null);

        try {
            const certification = await verifyCertification(verificationCode);
            setResult(certification);
            setVerified(certification.isVerified);
            toast({
                title: 'Verification Complete',
                description: certification.isVerified
                    ? 'Certificate is valid'
                    : 'Certificate could not be verified',
            });
        } catch (error) {
            setVerified(false);
            toast({
                title: 'Verification Failed',
                description: 'Invalid verification code',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Verify Certification
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <div className="flex gap-2">
                        <Input
                            id="verificationCode"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter verification code"
                        />
                        <Button onClick={handleVerify} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </div>
                </div>

                {verified !== null && (
                    <div
                        className={`p-4 rounded-lg border ${verified
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {verified ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span
                                className={`font-semibold ${verified ? 'text-green-800' : 'text-red-800'
                                    }`}
                            >
                                {verified ? 'Certificate Verified' : 'Verification Failed'}
                            </span>
                        </div>

                        {result && verified && (
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="font-medium">Name:</span> {result.name}
                                </p>
                                <p>
                                    <span className="font-medium">Issuer:</span> {result.issuer}
                                </p>
                                <p>
                                    <span className="font-medium">Issue Date:</span>{' '}
                                    {new Date(result.issueDate).toLocaleDateString()}
                                </p>
                                {result.expiryDate && (
                                    <p>
                                        <span className="font-medium">Expiry Date:</span>{' '}
                                        {new Date(result.expiryDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
