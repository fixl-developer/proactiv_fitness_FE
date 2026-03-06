'use client';

import React from 'react';
import CertificationVerification from '@/components/passport/CertificationVerification';

export default function VerifyCertificationPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Verify Certification</h1>
                <p className="text-muted-foreground">
                    Enter a verification code to validate a certification
                </p>
            </div>

            <div className="max-w-2xl">
                <CertificationVerification />
            </div>
        </div>
    );
}
