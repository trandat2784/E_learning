'use client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useState} from 'react';
import useProfessor from "../hooks/useProfessor";
import {WebSocketProvider} from "../context/web-socket-context";
import {usePathname} from "next/navigation";

const Providers = ({children}: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());
    return <QueryClientProvider client={queryClient}>
        <ProvidersWithWebSocket>

            {children}
        </ProvidersWithWebSocket>
    </QueryClientProvider>;
};
const ProvidersWithWebSocket = ({children}: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

    // 👇 Không gọi useProfessor nếu đang ở trang auth
    const {professor, isLoading} = useProfessor(!isAuthPage);

    // Nếu đang ở trang auth, render children luôn
    if (isAuthPage) {
        return <>{children}</>;
    }


    if (isLoading) return null;
    return (
        <>
            {professor && <WebSocketProvider professor={professor}>{children}</WebSocketProvider>}
            {!professor && children}
        </>
    )
}
export default Providers;
