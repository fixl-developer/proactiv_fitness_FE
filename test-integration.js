#!/usr/bin/env node

/**
 * ProActive Sports - Backend Integration Test Script
 * 
 * This script tests all the API endpoints to ensure proper integration
 * between frontend and backend services.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

console.log('🚀 Starting ProActive Sports Integration Tests...');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log('='.repeat(60));

// Test Results Storage
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Test function wrapper
async function runTest(testName, testFunction) {
    console.log(`\n🧪 Testing: ${testName}`);
    try {
        const result = await testFunction();
        if (result.success) {
            console.log(`✅ PASS: ${testName}`);
            testResults.passed++;
        } else {
            console.log(`❌ FAIL: ${testName} - ${result.message}`);
            testResults.failed++;
        }
        testResults.tests.push({ name: testName, ...result });
    } catch (error) {
        console.log(`❌ ERROR: ${testName} - ${error.message}`);
        testResults.failed++;
        testResults.tests.push({ name: testName, success: false, message: error.message });
    }
}

// Test Cases
const tests = {
    // 1. Health Check
    async healthCheck() {
        const result = await apiRequest('/');
        return {
            success: result.success && result.data.message,
            message: result.success ? 'API is responding' : 'API not responding'
        };
    },

    // 2. Team Service Tests
    async getPublicTeam() {
        const result = await apiRequest('/public/team');
        return {
            success: result.success && Array.isArray(result.data.data),
            message: result.success ? `Found ${result.data.data?.length || 0} team members` : 'Failed to fetch team'
        };
    },

    // 3. Location Service Tests
    async getLocations() {
        const result = await apiRequest('/locations');
        return {
            success: result.success,
            message: result.success ? `Found ${result.data.data?.length || 0} locations` : 'Failed to fetch locations'
        };
    },

    // 4. Schedule Service Tests
    async getSchedules() {
        const result = await apiRequest('/calendar/schedules');
        return {
            success: result.success,
            message: result.success ? `Found ${result.data.data?.length || 0} schedules` : 'Failed to fetch schedules'
        };
    },

    // 5. Coach Service Tests
    async getCoaches() {
        const result = await apiRequest('/coaches');
        return {
            success: result.success,
            message: result.success ? `Found ${result.data.data?.length || 0} coaches` : 'Failed to fetch coaches'
        };
    },

    // 6. Program Service Tests
    async getPrograms() {
        const result = await apiRequest('/programs');
        return {
            success: result.success,
            message: result.success ? `Found ${result.data.data?.length || 0} programs` : 'Failed to fetch programs'
        };
    },

    // 7. Booking Service Tests (Create)
    async createBooking() {
        const bookingData = {
            slotId: `test-${Date.now()}`,
            childInfo: {
                name: 'Test Child',
                age: 6,
                dateOfBirth: '2018-01-01',
                medicalNotes: 'No medical issues'
            },
            parentInfo: {
                name: 'Test Parent',
                email: 'test@example.com',
                phone: '+852 1234 5678',
                emergencyContact: '+852 1234 5678'
            },
            paymentMethod: 'trial',
            specialRequests: 'Integration test booking'
        };

        const result = await apiRequest('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });

        return {
            success: result.success,
            message: result.success ? 'Booking created successfully' : 'Failed to create booking',
            bookingId: result.data?.data?.id
        };
    }
};

// Run all tests
async function runAllTests() {
    console.log('🔍 Running Integration Tests...\n');

    await runTest('API Health Check', tests.healthCheck);
    await runTest('Get Public Team', tests.getPublicTeam);
    await runTest('Get Locations', tests.getLocations);
    await runTest('Get Schedules', tests.getSchedules);
    await runTest('Get Coaches', tests.getCoaches);
    await runTest('Get Programs', tests.getPrograms);
    await runTest('Create Booking', tests.createBooking);

    // Print Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

    if (testResults.failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.tests
            .filter(test => !test.success)
            .forEach(test => console.log(`   • ${test.name}: ${test.message}`));
    }

    console.log('\n🎯 Integration Status:');
    if (testResults.failed === 0) {
        console.log('🟢 ALL SYSTEMS OPERATIONAL - Backend integration complete!');
    } else if (testResults.passed > testResults.failed) {
        console.log('🟡 PARTIAL INTEGRATION - Some endpoints need attention');
    } else {
        console.log('🔴 INTEGRATION ISSUES - Backend may not be running or configured properly');
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Ensure backend server is running on port 5000');
    console.log('   2. Check database connection');
    console.log('   3. Verify environment variables');
    console.log('   4. Test frontend components manually');

    return testResults.failed === 0;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, tests };
} else {
    // Run tests if called directly
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}