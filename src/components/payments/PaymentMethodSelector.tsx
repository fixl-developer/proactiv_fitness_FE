'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Wallet, Building2, DollarSign } from 'lucide-react';

interface PaymentMethodSelectorProps {
    value: string;
    onChange: (value: string) => void;
    availableMethods?: string[];
}

export default function PaymentMethodSelector({
    value,
    onChange,
    availableMethods = ['card', 'wallet', 'bank_transfer', 'cash'],
}: PaymentMethodSelectorProps) {
    const paymentMethods = [
        {
            id: 'card',
            name: 'Credit/Debit Card',
            description: 'Pay securely with your card',
            icon: CreditCard,
        },
        {
            id: 'wallet',
            name: 'Wallet Balance',
            description: 'Use your wallet credits',
            icon: Wallet,
        },
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            description: 'Direct bank transfer',
            icon: Building2,
        },
        {
            id: 'cash',
            name: 'Cash',
            description: 'Pay with cash at location',
            icon: DollarSign,
        },
    ];

    const filteredMethods = paymentMethods.filter((method) =>
        availableMethods.includes(method.id)
    );

    return (
        <div className="space-y-4">
            <Label>Select Payment Method</Label>
            <RadioGroup value={value} onValueChange={onChange}>
                <div className="grid gap-4">
                    {filteredMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                            <Card
                                key={method.id}
                                className={`cursor-pointer transition-all ${value === method.id
                                        ? 'border-primary ring-2 ring-primary'
                                        : 'hover:border-primary/50'
                                    }`}
                                onClick={() => onChange(method.id)}
                            >
                                <CardContent className="flex items-center gap-4 p-4">
                                    <RadioGroupItem value={method.id} id={method.id} />
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor={method.id}
                                                className="font-medium cursor-pointer"
                                            >
                                                {method.name}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {method.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </RadioGroup>
        </div>
    );
}
