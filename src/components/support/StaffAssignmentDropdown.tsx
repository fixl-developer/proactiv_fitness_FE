'use client';

import React, { useState } from 'react';
import { supportTicketService } from '@/services/supportTicketService';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    department?: string;
}

interface StaffAssignmentDropdownProps {
    ticketId: string;
    currentAssignedTo?: string;
    currentAssignedToName?: string;
    staffMembers: StaffMember[];
    onAssignmentChange?: () => void;
}

export const StaffAssignmentDropdown: React.FC<StaffAssignmentDropdownProps> = ({
    ticketId,
    currentAssignedTo,
    currentAssignedToName,
    staffMembers,
    onAssignmentChange,
}) => {
    const [loading, setLoading] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(currentAssignedTo || '');

    const handleAssign = async (staffId: string) => {
        if (!staffId) {
            // Unassign
            try {
                setLoading(true);
                const response = await supportTicketService.unassignTicket(ticketId);
                if (response.success) {
                    setSelectedStaff('');
                    onAssignmentChange?.();
                }
            } catch (error) {
                console.error('Error unassigning ticket:', error);
            } finally {
                setLoading(false);
            }
            return;
        }

        const staff = staffMembers.find((s) => s.id === staffId);
        if (!staff) return;

        try {
            setLoading(true);
            const response = currentAssignedTo
                ? await supportTicketService.reassignTicket(ticketId, staff.id, staff.name, staff.email)
                : await supportTicketService.assignTicket(ticketId, staff.id, staff.name, staff.email);

            if (response.success) {
                setSelectedStaff(staffId);
                onAssignmentChange?.();
            }
        } catch (error) {
            console.error('Error assigning ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">Assign to Staff</label>
            <div className="flex gap-2">
                <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    disabled={loading}
                    className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Unassigned --</option>
                    {staffMembers.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.email})
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => handleAssign(selectedStaff)}
                    disabled={loading || selectedStaff === currentAssignedTo}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Assigning...' : 'Assign'}
                </button>
            </div>
            {currentAssignedToName && (
                <p className="text-sm text-gray-600">Currently assigned to: {currentAssignedToName}</p>
            )}
        </div>
    );
};
