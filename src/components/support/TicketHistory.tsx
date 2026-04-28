'use client';

import React, { useState, useEffect } from 'react';
import { supportTicketService, TicketHistory } from '@/services/supportTicketService';

interface TicketHistoryProps {
    ticketId: string;
}

export const TicketHistoryComponent: React.FC<TicketHistoryProps> = ({ ticketId }) => {
    const [history, setHistory] = useState<TicketHistory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [ticketId]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const response = await supportTicketService.getTicketHistory(ticketId);
            if (response.success) {
                setHistory(response.data);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChangeIcon = (changeType: string) => {
        const icons: { [key: string]: string } = {
            status: '📊',
            priority: '⚠️',
            assignment: '👤',
            escalation: '🚀',
            resolution: '✅',
            comment: '💬',
            attachment: '📎',
            other: '📝',
        };
        return icons[changeType] || '📝';
    };

    const formatValue = (value: any) => {
        if (value === null || value === undefined) return 'None';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change History</h3>

            {loading ? (
                <div className="text-center py-4">Loading history...</div>
            ) : history.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No changes recorded</div>
            ) : (
                <div className="space-y-3">
                    {history.map((entry) => (
                        <div key={entry._id} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-semibold">
                                        {getChangeIcon(entry.changeType)} {entry.changeType.toUpperCase()}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>{entry.fieldName}</strong>: {formatValue(entry.oldValue)} → {formatValue(entry.newValue)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        By {entry.changedBy} ({entry.changedByEmail})
                                    </p>
                                    {entry.reason && <p className="text-sm text-gray-700 mt-1">Reason: {entry.reason}</p>}
                                </div>
                                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                    {new Date(entry.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
