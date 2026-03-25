'use client'

import { useEffect, useRef, useCallback } from 'react'
import { eventBus } from '@/services/eventBus/eventBus'

/**
 * Hook that triggers a refetch function when real-time events arrive
 * for the specified modules. Uses the EventBus bridge from SocketProvider.
 *
 * Usage:
 *   useRealtimeRefresh(['booking', 'payment', 'program'], loadDashboardData)
 *
 * This will call loadDashboardData() whenever a booking:data:created,
 * booking:data:updated, booking:data:deleted, payment:data:*, or program:data:*
 * event arrives from the socket.
 */
export function useRealtimeRefresh(
    modules: string[],
    refetchFn: () => void,
    debounceMs: number = 1000
) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const refetchRef = useRef(refetchFn)

    // Keep refetchFn reference fresh without re-subscribing
    useEffect(() => {
        refetchRef.current = refetchFn
    }, [refetchFn])

    // Debounced refetch to avoid hammering the API on rapid events
    const debouncedRefetch = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            refetchRef.current()
        }, debounceMs)
    }, [debounceMs])

    useEffect(() => {
        const subscriptionIds: { eventType: string; id: string }[] = []

        for (const module of modules) {
            // Subscribe to all CRUD actions for this module via EventBus
            const actions = ['created', 'updated', 'deleted', 'cancelled', 'checkedIn', 'checkedOut', 'generated', 'published']

            for (const action of actions) {
                const eventType = `${module}:data:${action}`
                const id = eventBus.subscribe(
                    eventType,
                    (event) => {
                        // Only react to socket-originating events (not local UI events)
                        if (event.source === 'socket') {
                            debouncedRefetch()
                        }
                    }
                )
                subscriptionIds.push({ eventType, id })
            }
        }

        return () => {
            // Cleanup all subscriptions
            for (const { eventType, id } of subscriptionIds) {
                eventBus.unsubscribe(eventType, id)
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [modules.join(','), debouncedRefetch]) // eslint-disable-line react-hooks/exhaustive-deps
}
