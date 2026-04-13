import { apiClient } from '@/services/api/client';

// Localization Types
export interface Language {
    _id: string;
    code: string;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
    enabled: boolean;
    isDefault: boolean;
    completeness: number;
    createdAt: Date;
}

export interface Translation {
    _id: string;
    key: string;
    namespace: string;
    translations: Record<string, string>;
    context?: string;
    pluralForms?: Record<string, Record<string, string>>;
    updatedAt: Date;
}

export interface LocalizedContent {
    _id: string;
    contentType: 'page' | 'email' | 'sms' | 'notification' | 'document';
    contentId: string;
    language: string;
    content: Record<string, any>;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: Date;
}

export interface Currency {
    _id: string;
    code: string;
    name: string;
    symbol: string;
    exchangeRate: number;
    enabled: boolean;
    updatedAt: Date;
}

export interface RegionalSettings {
    _id: string;
    locationId: string;
    language: string;
    currency: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    numberFormat: {
        decimalSeparator: string;
        thousandsSeparator: string;
        decimalPlaces: number;
    };
    culturalSettings?: Record<string, any>;
}

// Localization Service
class LocalizationService {
    // Languages
    async getLanguages(): Promise<Language[]> {
        const response = await apiClient.get(`/localization/languages`);
        return response;
    }

    async getLanguageByCode(code: string): Promise<Language> {
        const response = await apiClient.get(`/localization/languages/${code}`);
        return response;
    }

    async createLanguage(data: Partial<Language>): Promise<Language> {
        const response = await apiClient.post(`/localization/languages`, data);
        return response;
    }

    async updateLanguage(code: string, data: Partial<Language>): Promise<Language> {
        const response = await apiClient.put(`/localization/languages/${code}`, data);
        return response;
    }

    async toggleLanguage(code: string, enabled: boolean): Promise<Language> {
        const response = await apiClient.patch(`/localization/languages/${code}/toggle`, {
            enabled
        });
        return response;
    }

    // Translations
    async getTranslations(namespace?: string, language?: string): Promise<Translation[]> {
        const response = await apiClient.get(`/localization/translations`, {
            params: { namespace, language }
        });
        return response;
    }

    async getTranslationByKey(key: string, language: string): Promise<Translation> {
        const response = await apiClient.get(`/localization/translations/${key}`, {
            params: { language }
        });
        return response;
    }

    async createTranslation(data: Partial<Translation>): Promise<Translation> {
        const response = await apiClient.post(`/localization/translations`, data);
        return response;
    }

    async updateTranslation(key: string, data: Partial<Translation>): Promise<Translation> {
        const response = await apiClient.put(`/localization/translations/${key}`, data);
        return response;
    }

    async deleteTranslation(key: string): Promise<void> {
        await apiClient.delete(`/localization/translations/${key}`);
    }

    async bulkImportTranslations(data: {
        language: string;
        namespace: string;
        translations: Record<string, string>;
    }): Promise<{ imported: number; failed: number }> {
        const response = await apiClient.post(`/localization/translations/bulk-import`, data);
        return response;
    }

    async exportTranslations(language: string, namespace?: string): Promise<Blob> {
        const response = await apiClient.get(`/localization/translations/export`, {
            params: { language, namespace },
            responseType: 'blob'
        });
        return response;
    }

    // Localized Content
    async getLocalizedContent(contentType: string, contentId: string, language: string): Promise<LocalizedContent> {
        const response = await apiClient.get(`/localization/content`, {
            params: { contentType, contentId, language }
        });
        return response;
    }

    async createLocalizedContent(data: Partial<LocalizedContent>): Promise<LocalizedContent> {
        const response = await apiClient.post(`/localization/content`, data);
        return response;
    }

    async updateLocalizedContent(id: string, data: Partial<LocalizedContent>): Promise<LocalizedContent> {
        const response = await apiClient.put(`/localization/content/${id}`, data);
        return response;
    }

    async publishLocalizedContent(id: string): Promise<LocalizedContent> {
        const response = await apiClient.post(`/localization/content/${id}/publish`);
        return response;
    }

    // Currencies
    async getCurrencies(): Promise<Currency[]> {
        const response = await apiClient.get(`/localization/currencies`);
        return response;
    }

    async updateExchangeRate(code: string, rate: number): Promise<Currency> {
        const response = await apiClient.patch(`/localization/currencies/${code}/rate`, {
            rate
        });
        return response;
    }

    async convertCurrency(amount: number, from: string, to: string): Promise<{
        amount: number;
        converted: number;
        rate: number;
    }> {
        const response = await apiClient.get(`/localization/currencies/convert`, {
            params: { amount, from, to }
        });
        return response;
    }

    // Regional Settings
    async getRegionalSettings(locationId: string): Promise<RegionalSettings> {
        const response = await apiClient.get(`/localization/regional-settings/${locationId}`);
        return response;
    }

    async updateRegionalSettings(
        locationId: string,
        data: Partial<RegionalSettings>
    ): Promise<RegionalSettings> {
        const response = await apiClient.put(
            `/localization/regional-settings/${locationId}`,
            data
        );
        return response;
    }

    // Auto-translation
    async autoTranslate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<{
        translatedText: string;
        confidence: number;
    }> {
        const response = await apiClient.post(`/localization/auto-translate`, {
            text,
            targetLanguage,
            sourceLanguage
        });
        return response;
    }
}

export default new LocalizationService();
