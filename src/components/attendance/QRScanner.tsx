'use client';

import { useState } from 'react';
import { attendanceApi } from '@/lib/api/attendance';
import { toast } from 'sonner';

export default function QRScanner() {
    const [scanning, setScanning] = useState(false);
    const [qrData, setQrData] = useState('');

    const handleScan = async () => {
        if (!qrData) {
            toast.error('Please enter QR code data');
            return;
        }

        try {
            setScanning(true);
            const attendance = await attendanceApi.scanQRCode(qrData);
            toast.success(`${attendance.studentName} checked in successfully`);
            setQrData('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to scan QR code');
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Code Scanner</h2>

            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-gray-600 mb-2">Scan student QR code</p>
                    <p className="text-sm text-gray-500">Position QR code within frame</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Or Enter QR Code</label>
                    <input
                        type="text"
                        value={qrData}
                        onChange={(e) => setQrData(e.target.value)}
                        placeholder="Enter QR code data"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {scanning ? 'Scanning...' : 'Scan QR Code'}
                </button>
            </div>
        </div>
    );
}
