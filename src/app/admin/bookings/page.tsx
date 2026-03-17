'use client'

import BookingManagement from '@/components/booking/BookingManagement'

const AdminBookingsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                <BookingManagement
                    userRole="ADMIN"
                    locationAccess={['Cyberport', 'Wan Chai']}
                />
            </div>
        </div>
    )
}

export default AdminBookingsPage
