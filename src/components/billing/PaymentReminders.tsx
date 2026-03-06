'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentRemindersProps {
    invoiceId: string;
    studentName: string;
    parentEmail: string;
    amountDue: number;
    onSend: (data: ReminderData) => Promise<void>;
}

interface ReminderData {
    invoiceId: string;
    reminderType: string;
    message: string;
}

export default function PaymentReminders({
    invoiceId,
    studentName,
    parentEmail,
    amountDue,
    onSend,
}: PaymentRemindersProps) {
    const { toast } = useToast();
    const [reminderType, setReminderType] = useState('gentle');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const reminderTemplates = {
        gentle: `Dear Parent,\n\nThis is a friendly reminder that payment for ${studentName}'s classes is due. The outstanding amount is AED ${amountDue}.\n\nPlease make the payment at your earliest convenience.\n\nThank you!`,
        firm: `Dear Parent,\n\nWe notice that payment for ${studentName}'s classes is overdue. The outstanding amount is AED ${amountDue}.\n\nPlease settle this payment immediately to avoid any disruption to the classes.\n\nThank you for your prompt attention.`,
        final: `Dear Parent,\n\nThis is a final reminder regarding the overdue payment for ${studentName}'s classes. The outstanding amount is AED ${amountDue}.\n\nIf payment is not received within 48 hours, we may need to suspend class access.\n\nPlease contact us immediately if you have any concerns.`,
    };

    const handleReminderTypeChange = (value: string) => {
        setReminderType(value);
        setMessage(reminderTemplates[value as keyof typeof reminderTemplates]);
    };

    const handleSend = async () => {
        if (!message.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a reminder message',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            await onSend({
                invoiceId,
                reminderType,
                message,
            });

            toast({
                title: 'Reminder Sent',
                description: `Payment reminder sent to ${parentEmail}`,
            });

            setMessage('');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to send reminder',
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
                    <Bell className="h-5 w-5" />
                    Send Payment Reminder
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Reminder Type</Label>
                    <Select value={reminderType} onValueChange={handleReminderTypeChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gentle">Gentle Reminder</SelectItem>
                            <SelectItem value="firm">Firm Reminder</SelectItem>
                            <SelectItem value="final">Final Notice</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={8}
                        placeholder="Enter reminder message..."
                    />
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Will be sent to: {parentEmail}
                    </p>
                    <Button onClick={handleSend} disabled={loading}>
                        <Send className="h-4 w-4 mr-2" />
                        {loading ? 'Sending...' : 'Send Reminder'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
