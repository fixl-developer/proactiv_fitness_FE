export interface CacheEntry<T = any> {
    key: string
    value: T
    ttl: number
    createdAt: number
    expiresAt: number
    accessCount: number
    lastAccessedAt: number
}

export interface CacheStats {
    totalEntries: number
    totalSize: number
    hitRate: number
    missRate: number
    evictions: number
}

class CacheManager {
    private cache: Map<string, CacheEntry> = new Map()
    private stats = {
        hits: 0,
        misses: 0,
        evictions: 0
    }
    private readonly MAX_CACHE_SIZE = 10 * 1024 * 1024 // 10MB
    private currentSize = 0

    get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) {
            this.stats.misses++
            return null
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            this.currentSize -= this.getEntrySize(entry)
            this.stats.misses++
            return null
        }

        // Update access info
        entry.accessCount++
        entry.lastAccessedAt = Date.now()

        this.stats.hits++
        return entry.value as T
    }

    set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
        const now = Date.now()
        const entry: CacheEntry<T> = {
            key,
            value,
            ttl,
            createdAt: now,
            expiresAt: now + ttl,
            accessCount: 0,
            lastAccessedAt: now
        }

        const entrySize = this.getEntrySize(entry)

        // Remove old entry if exists
        const oldEntry = this.cache.get(key)
        if (oldEntry) {
            this.currentSize -= this.getEntrySize(oldEntry)
        }

        // Check if we need to evict
        if (this.currentSize + entrySize > this.MAX_CACHE_SIZE) {
            this.evictLRU()
        }

        this.cache.set(key, entry)
        this.currentSize += entrySize
    }

    invalidate(key: string): void {
        const entry = this.cache.get(key)
        if (entry) {
            this.cache.delete(key)
            this.currentSize -= this.getEntrySize(entry)
        }
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern)
        const keysToDelete: string[] = []

        for (const [key, entry] of this.cache.entries()) {
            if (regex.test(key)) {
                keysToDelete.push(key)
                this.currentSize -= this.getEntrySize(entry)
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key))
    }

    clear(): void {
        this.cache.clear()
        this.currentSize = 0
        this.stats = { hits: 0, misses: 0, evictions: 0 }
    }

    private evictLRU(): void {
        let lruKey: string | null = null
        let lruTime = Date.now()

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessedAt < lruTime) {
                lruTime = entry.lastAccessedAt
                lruKey = key
            }
        }

        if (lruKey) {
            const entry = this.cache.get(lruKey)!
            this.cache.delete(lruKey)
            this.currentSize -= this.getEntrySize(entry)
            this.stats.evictions++
        }
    }

    private getEntrySize(entry: CacheEntry): number {
        // Rough estimation of entry size in bytes
        return JSON.stringify(entry).length
    }

    getStats(): CacheStats {
        const total = this.stats.hits + this.stats.misses
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
        const missRate = total > 0 ? (this.stats.misses / total) * 100 : 0

        return {
            totalEntries: this.cache.size,
            totalSize: this.currentSize,
            hitRate,
            missRate,
            evictions: this.stats.evictions
        }
    }

    getSize(): number {
        return this.currentSize
    }

    getEntryCount(): number {
        return this.cache.size
    }

    hasKey(key: string): boolean {
        const entry = this.cache.get(key)
        if (!entry) return false

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            this.currentSize -= this.getEntrySize(entry)
            return false
        }

        return true
    }

    getAllKeys(): string[] {
        const keys: string[] = []
        for (const [key, entry] of this.cache.entries()) {
            if (Date.now() <= entry.expiresAt) {
                keys.push(key)
            }
        }
        return keys
    }

    cleanExpired(): number {
        let cleaned = 0
        const now = Date.now()

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key)
                this.currentSize -= this.getEntrySize(entry)
                cleaned++
            }
        }

        return cleaned
    }
}

export const cacheManager = new CacheManager()
export default CacheManager
