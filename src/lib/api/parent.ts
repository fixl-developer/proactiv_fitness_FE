import axios from 'axios';
import type {
    ParentProfile,
    ChildProgress,
    UpcomingClass,
    ParentNotification,
    FamilyCalendarEvent,
    ParentCommunication,
} from '@/types/parent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Parent Profile
export const getParentProfile = async (userId: string): Promise<ParentProfile> => {
    const response = await axios.get(`${API_URL}/parent/profile/${userId}`);
    return response.data;
};

export const updateParentProfile = async (
    userId: string,
    data: Partial<ParentProfile>
): Promise<ParentProfile> => {
    const response = await axios.put(`${API_URL}/parent/profile/${userId}`, data);
    return response.data;
};

// Child Progress
export const getChildProgress = async (childId: string): Promise<ChildProgress> => {
    const response = await axios.get(`${API_URL}/parent/child/${childId}/progress`);
    return response.data;
};

// Upcoming Classes
export const getUpcomingClasses = async (parentId: string): Promise<UpcomingClass[]> => {
    const response = await axios.get(`${API_URL}/parent/${parentId}/upcoming-classes`);
    return response.data;
};

// Notifications
export const getParentNotifications = async (
    parentId: string
): Promise<ParentNotification[]> => {
    const response = await axios.get(`${API_URL}/parent/${parentId}/notifications`);
    return response.data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    await axios.put(`${API_URL}/parent/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async (parentId: string): Promise<void> => {
    await axios.put(`${API_URL}/parent/${parentId}/notifications/read-all`);
};

// Family Calendar
export const getFamilyCalendar = async (
    parentId: string,
    startDate: string,
    endDate: string
): Promise<FamilyCalendarEvent[]> => {
    const response = await axios.get(`${API_URL}/parent/${parentId}/calendar`, {
        params: { startDate, endDate },
    });
    return response.data;
};

// Communications
export const getParentCommunications = async (
    parentId: string
): Promise<ParentCommunication[]> => {
    const response = await axios.get(`${API_URL}/parent/${parentId}/communications`);
    return response.data;
};

export const sendMessage = async (
    data: Omit<ParentCommunication, 'id' | 'isRead' | 'createdAt'>
): Promise<ParentCommunication> => {
    const response = await axios.post(`${API_URL}/parent/communications`, data);
    return response.data;
};
