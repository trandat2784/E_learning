"use client"
import {createContext, useContext, useEffect, useRef, useState} from "react";

const WebSocketContext = createContext<any>(null);
export const WebSocketProvider = ({
                                      children, professor
                                  }: {
    children: React.ReactNode;
    professor: any
}) => {
    const [wsReady, setWsReady] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    useEffect(() => {
        if (!professor?.id) return
        const ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!)
        ws.onopen = () => {
            ws.send(`professor_${professor.id}`)
            setWsReady(true);
            wsRef.current = ws;
        }
        ws.onmessage = event => {
            const data = JSON.parse(event.data)
            if (data.type == "UNSEEN_COUNT_UPDATE") {
                const {conversationId, count} = data.payload
                setUnreadCounts((prev: any) => ({...prev, [conversationId]: count}))
            }
        }
        return () => {
            ws.close()
        }
    }, [professor?.id])
    // if (!wsReady) return null;
    return <WebSocketContext.Provider value={{ws: wsRef.current, unreadCounts}}>
        {children}
    </WebSocketContext.Provider>
}
export const useWebSocket = () => useContext(WebSocketContext)