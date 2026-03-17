export type EventAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ALERT' | 'NOTIFICATION'

export interface Event {
    type: string
    module: string
    action: EventAction
    data: any
    timestamp: number
    userId?: string
    source?: string
}

export type EventCallback = (event: Event) => void

interface Subscription {
    id: string
    callback: EventCallback
    filter?: (event: Event) => boolean
}

class EventBus {
    private subscriptions: Map<string, Subscription[]> = new Map()
    private offlineQueue: Event[] = []
    private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    private subscriptionCounter = 0

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.isOnline = true
                this.flushQueue()
            })
            window.addEventListener('offline', () => {
                this.isOnline = false
            })
        }
    }

    subscribe(eventType: string, callback: EventCallback, filter?: (event: Event) => boolean): string {
        const subscriptionId = `sub_${++this.subscriptionCounter}`

        if (!this.subscriptions.has(eventType)) {
            this.subscriptions.set(eventType, [])
        }

        this.subscriptions.get(eventType)!.push({
            id: subscriptionId,
            callback,
            filter
        })

        console.log(`[EventBus] Subscribed to ${eventType} with ID ${subscriptionId}`)

        return subscriptionId
    }

    unsubscribe(eventType: string, subscriptionId: string): void {
        const subs = this.subscriptions.get(eventType)
        if (subs) {
            const index = subs.findIndex(sub => sub.id === subscriptionId)
            if (index !== -1) {
                subs.splice(index, 1)
                console.log(`[EventBus] Unsubscribed from ${eventType}`)
            }
        }
    }

    subscribeToModule(moduleName: string, callback: EventCallback): string {
        return this.subscribe(`module:${moduleName}`, callback)
    }

    unsubscribeFromModule(moduleName: string, subscriptionId: string): void {
        this.unsubscribe(`module:${moduleName}`, subscriptionId)
    }

    publish(event: Omit<Event, 'timestamp'>): void {
        const fullEvent: Event = {
            ...event,
            timestamp: Date.now()
        }

        console.log('[EventBus] Publishing event:', fullEvent)

        // Publish to specific event type subscribers
        this.publishToSubscribers(event.type, fullEvent)

        // Publish to module subscribers
        this.publishToSubscribers(`module:${event.module}`, fullEvent)

        // Publish to wildcard subscribers
        this.publishToSubscribers('*', fullEvent)

        // Queue if offline
        if (!this.isOnline) {
            this.offlineQueue.push(fullEvent)
        }
    }

    private publishToSubscribers(eventType: string, event: Event): void {
        const subs = this.subscriptions.get(eventType)
        if (!subs) return

        for (const sub of subs) {
            try {
                if (!sub.filter || sub.filter(event)) {
                    sub.callback(event)
                }
            } catch (error) {
                console.error(`[EventBus] Error in subscriber for ${eventType}:`, error)
            }
        }
    }

    private flushQueue(): void {
        if (this.offlineQueue.length === 0) return

        console.log(`[EventBus] Flushing ${this.offlineQueue.length} queued events`)

        const queue = [...this.offlineQueue]
        this.offlineQueue = []

        for (const event of queue) {
            this.publishToSubscribers(event.type, event)
            this.publishToSubscribers(`module:${event.module}`, event)
            this.publishToSubscribers('*', event)
        }
    }

    getQueueSize(): number {
        return this.offlineQueue.length
    }

    isConnected(): boolean {
        return this.isOnline
    }

    getSubscriberCount(eventType: string): number {
        return this.subscriptions.get(eventType)?.length || 0
    }

    getAllSubscriptions(): Record<string, number> {
        const result: Record<string, number> = {}
        for (const [eventType, subs] of this.subscriptions.entries()) {
            result[eventType] = subs.length
        }
        return result
    }

    clearSubscriptions(eventType?: string): void {
        if (eventType) {
            this.subscriptions.delete(eventType)
        } else {
            this.subscriptions.clear()
        }
    }

    // Convenience methods for common events
    publishDataCreated(module: string, data: any, userId?: string): void {
        this.publish({
            type: `${module}:data:created`,
            module,
            action: 'CREATE',
            data,
            userId,
            source: 'frontend'
        })
    }

    publishDataUpdated(module: string, data: any, userId?: string): void {
        this.publish({
            type: `${module}:data:updated`,
            module,
            action: 'UPDATE',
            data,
            userId,
            source: 'frontend'
        })
    }

    publishDataDeleted(module: string, data: any, userId?: string): void {
        this.publish({
            type: `${module}:data:deleted`,
            module,
            action: 'DELETE',
            data,
            userId,
            source: 'frontend'
        })
    }

    publishUserLogin(userId: string, email: string): void {
        this.publish({
            type: 'user:login',
            module: 'auth',
            action: 'LOGIN',
            data: { userId, email },
            userId,
            source: 'frontend'
        })
    }

    publishUserLogout(userId: string): void {
        this.publish({
            type: 'user:logout',
            module: 'auth',
            action: 'LOGOUT',
            data: { userId },
            userId,
            source: 'frontend'
        })
    }

    publishAlert(message: string, type: 'info' | 'warning' | 'error' | 'success'): void {
        this.publish({
            type: 'system:alert',
            module: 'system',
            action: 'ALERT',
            data: { message, type },
            source: 'frontend'
        })
    }

    publishNotification(title: string, message: string, type: string): void {
        this.publish({
            type: 'system:notification',
            module: 'system',
            action: 'NOTIFICATION',
            data: { title, message, type },
            source: 'frontend'
        })
    }
}

export const eventBus = new EventBus()
export default EventBus
