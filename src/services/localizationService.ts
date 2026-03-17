import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.get(`${API_URL}/localization/languages`);
        return response.data;
    }

    async getLanguageByCode(code: string): Promise<Language> {
        const response = await axios.get(`${API_URL}/localization/languages/${code}`);
        return response.data;
    }

    async createLanguage(data: Partial<Language>): Promise<Language> {
        const response = await axios.post(`${API_URL}/localization/languages`, data);
        return response.data;
    }

    async updateLanguage(code: string, data: Partial<Language>): Promise<Language> {
        const response = await axios.put(`${API_URL}/localization/languages/${code}`, data);
        return response.data;
    }

    async toggleLanguage(code: string, enabled: boolean): Promise<Language> {
        const response = await axios.patch(`${API_URL}/localization/languages/${code}/toggle`, {
            enabled
        });
        return response.data;
    }

    // Translations
    async getTranslations(namespace?: string, language?: string): Promise<Translation[]> {
        const response = await axios.get(`${API_URL}/localization/translations`, {
            params: { namespace, language }
        });
        return response.data;
    }

    async getTranslationByKey(key: string, language: string): Promise<Translation> {
        const response = await axios.get(`${API_URL}/localization/translations/${key}`, {
            params: { language }
        });
        return response.data;
    }

    async createTranslation(data: Partial<Translation>): Promise<Translation> {
        const response = await axios.post(`${API_URL}/localization/translations`, data);
        return response.data;
    }

    async updateTranslation(key: string, data: Partial<Translation>): Promise<Translation> {
        const response = await axios.put(`${API_URL}/localization/translations/${key}`, data);
        return response.data;
    }

    async deleteTranslation(key: string): Promise<void> {
        await axios.delete(`${API_URL}/localization/translations/${key}`);
    }

    async bulkImportTranslations(data: {
        language: string;
        namespace: string;
        translations: Record<string, string>;
    }): Promise<{ imported: number; failed: number }> {
        const response = await axios.post(`${API_URL}/localization/translations/bulk-import`, data);
        return response.data;
    }

    async exportTranslations(language: string, namespace?: string): Promise<Blob> {
        const response = await axios.get(`${API_URL}/localization/translations/export`, {
            params: { language, namespace },
            responseType: 'blob'
        });
        return response.data;
    }

    // Localized Content
    async getLocalizedContent(contentType: string, contentId: string, language: string): Promise<LocalizedContent> {
        const response = await axios.get(`${API_URL}/localization/content`, {
            params: { contentType, contentId, language }
        });
        return response.data;
    }

    async createLocalizedContent(data: Partial<LocalizedContent>): Promise<LocalizedContent> {
        const response = await axios.post(`${API_URL}/localization/content`, data);
        return response.data;
    }

    async updateLocalizedContent(id: string, data: Partial<LocalizedContent>): Promise<LocalizedContent> {
        const response = await axios.put(`${API_URL}/localization/content/${id}`, data);
        return response.data;
    }

    async publishLocalizedContent(id: string): Promise<LocalizedContent> {
        const response = await axios.post(`${API_URL}/localization/content/${id}/publish`);
        return response.data;
    }

    // Currencies
    async getCurrencies(): Promise<Currency[]> {
        const response = await axios.get(`${API_URL}/localization/currencies`);
        return response.data;
    }

    async updateExchangeRate(code: string, rate: number): Promise<Currency> {
        const response = await axios.patch(`${API_URL}/localization/currencies/${code}/rate`, {
            rate
        });
        return response.data;
    }

    async convertCurrency(amount: number, from: string, to: string): Promise<{
        amount: number;
        converted: number;
        rate: number;
    }> {
        const response = await axios.get(`${API_URL}/localization/currencies/convert`, {
            params: { amount, from, to }
        });
        return response.data;
    }

    // Regional Settings
    async getRegionalSettings(locationId: string): Promise<RegionalSettings> {
        const response = await axios.get(`${API_URL}/localization/regional-settings/${locationId}`);
        return response.data;
    }

    async updateRegionalSettings(
        locationId: string,
        data: Partial<RegionalSettings>
    ): Promise<RegionalSettings> {
        const response = await axios.put(
            `${API_URL}/localization/regional-settings/${locationId}`,
            data
        );
        return response.data;
    }

    // Auto-translation
    async autoTranslate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<{
        translatedText: string;
        confidence: number;
    }> {
        const response = await axios.post(`${API_URL}/localization/auto-translate`, {
            text,
            targetLanguage,
            sourceLanguage
        });
        return response.data;
    }
}

export default new LocalizationService();
