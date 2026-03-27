'use client'

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import { eventBus } from '@/services/eventBus/eventBus'
import { useNotificationStore, InAppNotification } from '@/store/notificationStore'
import { toast } from 'sonner'
import {
    REALTIME_ENTITIES,
    CRUD_ACTIONS,
    SocketCrudPayload,
    socketEventToEventBusType,
    socketEventToAction,
    getToastMessage,
    shouldShowToast,
} from '@/services/socket/socketEvents'

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (process.env.NEXT_PUBLIC_API_BASE_URL
        ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api(\/v\d+)?\/?$/, '')
        : 'http://localhost:3001')

export interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
    connectionError: string | null
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    connectionError: null,
})

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth()
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const socketRef = useRef<Socket | null>(null)
    const { addNotification, setNotifications } = useNotificationStore()

    // Convert backend notification records to InAppNotification format
    const mapPendingNotifications = useCallback((notifications: any[]) => {
        return notifications.map((n: any): InAppNotification => ({
            id: n._id || n.id || `notif-${Date.now()}-${Math.random()}`,
            title: n.title || 'Notification',
            message: n.message || '',
            type: n.category === 'alert' ? 'warning' : 'info',
            module: n.entityType || n.category || 'system',
            isRead: n.status === 'read',
            createdAt: new Date(n.createdAt).getTime(),
            eventType: n.eventType,
            entityId: n.entityId,
        }))
    }, [])

    useEffect(() => {
        // Only connect when authenticated
        if (!isAuthenticated || !user) {
            // Disconnect if was connected
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
                setIsConnected(false)
            }
            return
        }

        // Get token from localStorage
        const token = localStorage.getItem('token')
        if (!token) return

        // Create socket connection
        const socket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 30000,
            timeout: 10000,
            transports: ['websocket', 'polling'],
        })

        socketRef.current = socket

        // Connection handlers
        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id)
            setIsConnected(true)
            setConnectionError(null)
        })

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason)
            setIsConnected(false)
        })

        socket.on('connect_error', (error) => {
            console.warn('[Socket] Connection error:', error.message)
            setConnectionError(error.message)
            setIsConnected(false)
        })

        // Connection confirmation from server
        socket.on('connected', (data: any) => {
            console.log('[Socket] Authenticated:', data.role, '| Rooms:', data.rooms)
        })

        // Pending notifications delivery (on connect + reconnect)
        socket.on('notifications:pending', (notifications: any[]) => {
            if (notifications && notifications.length > 0) {
                const mapped = mapPendingNotifications(notifications)
                mapped.forEach((n) => addNotification(n))
                console.log(`[Socket] Received ${notifications.length} pending notifications`)
            }
        })

        // Force logout
        socket.on('auth:force-logout', () => {
            toast.error('Your session has been terminated')
            // The AuthContext logout will handle cleanup
        })

        // System alerts
        socket.on('system:alert', (data: any) => {
            const level = data?.data?.type || 'info'
            const message = data?.data?.message || 'System alert'
            switch (level) {
                case 'error': toast.error(message); break
                case 'warning': toast.warning(message); break
                case 'success': toast.success(message); break
                default: toast.info(message)
            }
        })

        // Register listeners for all entity CRUD events
        for (const entity of REALTIME_ENTITIES) {
            for (const action of CRUD_ACTIONS) {
                const eventName = `${entity}:${action}`
                socket.on(eventName, (payload: SocketCrudPayload) => {
                    handleCrudEvent(eventName, entity, action, payload)
                })
            }
        }

        // Connect
        socket.connect()

        // On reconnect, sync notifications
        socket.on('reconnect', () => {
            console.log('[Socket] Reconnected — syncing notifications')
            socket.emit('notifications:sync')
        })

        // Cleanup on unmount or auth change
        return () => {
            socket.removeAllListeners()
            socket.disconnect()
            socketRef.current = null
            setIsConnected(false)
        }
    }, [isAuthenticated, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Handle a CRUD event from the backend:
     * 1. Bridge to EventBus (so existing subscribers react)
     * 2. Show toast for important events
     * 3. Add to notification store
     */
    function handleCrudEvent(
        eventName: string,
        entity: string,
        action: string,
        payload: SocketCrudPayload
    ) {
        // 1. Bridge to frontend EventBus
        const eventBusType = socketEventToEventBusType(eventName)
        const eventBusAction = socketEventToAction(eventName)
        eventBus.publish({
            type: eventBusType,
            module: entity,
            action: eventBusAction as any,
            data: payload.data,
            userId: payload.actorId,
            source: 'socket',
        })

        // 2. Show toast for non-update events
        if (shouldShowToast(action)) {
            const { title, description } = getToastMessage(entity, action, payload.data)
            toast.info(title, { description })
        }

        // 3. Add to notification store
        const { title, description } = getToastMessage(entity, action, payload.data)
        addNotification({
            id: `${eventName}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            title,
            message: description,
            type: action === 'deleted' || action === 'cancelled' ? 'warning' : 'info',
            module: entity,
            isRead: false,
            createdAt: Date.now(),
            eventType: eventName,
            entityId: payload.data?._id || payload.data?.id,
        })
    }

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current,
                isConnected,
                connectionError,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export function useSocketContext(): SocketContextType {
    return useContext(SocketContext)
}

export default SocketContext
