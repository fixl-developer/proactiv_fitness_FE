// Data Management types

export interface DataExportRequest {
    id: string;
    userId: string;
    type: 'full' | 'partial';
    format: 'json' | 'csv' | 'xml';
    entities: string[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    requestedAt: string;
    completedAt?: string;
    downloadUrl?: string;
    expiresAt?: string;
    error?: string;
}

export interface DataDeletionRequest {
    id: string;
    userId: string;
    type: 'soft' | 'hard';
    reason: string;
    entities: string[];
    status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
    requestedAt: string;
    approvedAt?: string;
    completedAt?: string;
    certificateUrl?: string;
    error?: string;
}

export interface RetentionPolicy {
    id: string;
    entity: string;
    retentionPeriod: number; // in days
    action: 'archive' | 'delete' | 'anonymize';
    enabled: boolean;
    lastRunAt?: string;
}

export interface DataInventory {
    entity: string;
    count: number;
    size: number; // in bytes
    oldestRecord: string;
    newestRecord: string;
    piiFields: string[];
}

export interface AnonymizationLog {
    id: string;
    entity: string;
    recordId: string;
    fields: string[];
    anonymizedAt: string;
    reason: string;
}
