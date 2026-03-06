'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Paperclip } from 'lucide-react';
import type { ParentCommunication } from '@/types/parent';

interface CommunicationCenterProps {
    communications: ParentCommunication[];
    onSendMessage: () => void;
}

export default function CommunicationCenter({
    communications,
    onSendMessage,
}: CommunicationCenterProps) {
    const unreadCount = communications.filter((c) => !c.isRead).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Messages
                        {unreadCount > 0 && (
                            <Badge variant="destructive">{unreadCount}</Badge>
                        )}
                    </CardTitle>
                    <Button onClick={onSendMessage}>
                        <Send className="h-4 w-4 mr-2" />
                        New Message
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {communications.map((comm) => (
                        <div
                            key={comm.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${comm.isRead ? 'bg-background' : 'bg-blue-50 border-blue-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold">{comm.subject}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        From: {comm.from}
                                    </p>
                                </div>
                                {!comm.isRead && (
                                    <Badge variant="secondary">New</Badge>
                                )}
                            </div>
                            <p className="text-sm mb-2 line-clamp-2">{comm.message}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{new Date(comm.createdAt).toLocaleString()}</span>
                                {comm.attachments.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Paperclip className="h-3 w-3" />
                                        <span>{comm.attachments.length} attachments</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
