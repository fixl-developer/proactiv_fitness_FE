import axios from 'axios';
import type {
    AthletePassport,
    SkillProgress,
    Milestone,
    PerformanceBenchmark,
    BehavioralTracking,
    Certification,
    PassportTranscript,
} from '@/types/passport';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Passport
export const getAthletePassport = async (studentId: string): Promise<AthletePassport> => {
    const response = await axios.get(`${API_URL}/passport/${studentId}`);
    return response.data;
};

export const getPassportTranscript = async (studentId: string): Promise<PassportTranscript> => {
    const response = await axios.get(`${API_URL}/passport/${studentId}/transcript`);
    return response.data;
};

export const exportPassportPDF = async (studentId: string): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/passport/${studentId}/export`, {
        responseType: 'blob',
    });
    return response.data;
};

// Skills
export const getSkillProgress = async (studentId: string): Promise<SkillProgress[]> => {
    const response = await axios.get(`${API_URL}/passport/${studentId}/skills`);
    return response.data;
};

export const updateSkillProgress = async (
    skillId: string,
    data: Partial<SkillProgress>
): Promise<SkillProgress> => {
    const response = await axios.put(`${API_URL}/passport/skills/${skillId}`, data);
    return response.data;
};

// Milestones
export const getMilestones = async (studentId: string): Promise<Milestone[]> => {
    const response = await axios.get(`${API_URL}/passport/${studentId}/milestones`);
    return response.data;
};

// Benchmarks
export const getPerformanceBenchmarks = async (
    studentId: string
): Promise<PerformanceBenchmark[]> => {
    const response = await axios.get(`${API_URL}/passport/${studentId}/benchmarks`);
    return response.data;
};

export const addPerformanceBenchmark = async (
    data: Omit<PerformanceBenchmark, 'id'>
): Promise<PerformanceBenchmark> => {
    const response = await axios.post(`${API_URL}/passport/benchmarks`, data);
    return response.data;
};

// Behavioral Tracking
export const getBehavioralTracking = async (
    studentId: string
): Promise<BehavioralTracking[]> => {
    const response = await axios.get(`${API_URL}/passport/${studentId}/behavior`);
    return response.data;
};

export const addBehavioralRecord = async (
    data: Omit<BehavioralTracking, 'id'>
): Promise<BehavioralTracking> => {
    const response = await axios.post(`${API_URL}/passport/behavior`, data);
    return response.data;
};

// Certifications
export const getCertifications = async (studentId: string): Promise<Certification[]> => {
    const response = await axios.get(`${API_URL}/passport/${studentId}/certifications`);
    return response.data;
};

export const verifyCertification = async (verificationCode: string): Promise<Certification> => {
    const response = await axios.get(`${API_URL}/passport/certifications/verify/${verificationCode}`);
    return response.data;
};
