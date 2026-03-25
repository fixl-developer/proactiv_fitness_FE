'use client'

import { useEffect, useCallback } from 'react'
import { useSocketContext } from '@/contexts/SocketContext'

/**
 * Get the socket context (socket instance, connection status)
 */
export function useSocket() {
    return useSocketContext()
}

/**
 * Subscribe to a specific socket event with auto-cleanup on unmount
 */
export function useSocketEvent(eventName: string, callback: (data: any) => void) {
    const { socket } = useSocketContext()

    useEffect(() => {
        if (!socket) return

        socket.on(eventName, callback)
        return () => {
            socket.off(eventName, callback)
        }
    }, [socket, eventName, callback])
}

/**
 * Subscribe to all CRUD events for a module (created, updated, deleted)
 */
export function useSocketModule(module: string, callback: (data: any) => void) {
    const { socket } = useSocketContext()

    useEffect(() => {
        if (!socket) return

        const events = [
            `${module}:created`,
            `${module}:updated`,
            `${module}:deleted`,
            `${module}:cancelled`,
        ]

        events.forEach((event) => socket.on(event, callback))

        return () => {
            events.forEach((event) => socket.off(event, callback))
        }
    }, [socket, module, callback])
}
