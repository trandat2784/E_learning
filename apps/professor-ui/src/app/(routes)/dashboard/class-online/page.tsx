"use client";

import {useEffect, useRef, useState} from "react";
import type {Call} from "@stream-io/video-react-sdk";
import {
    CallControls,
    CallingState,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    StreamVideo,
    StreamVideoClient,
    useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {Loader2, LogOut, Phone, Users, Video} from "lucide-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import axiosInstance from "../../../../utils/axiosInstance";

const apiKey = "9jnkr363ckqe";
const roomId = "lop-hoc-online";

// Loading Screen Component
function LoadingScreen({text}: { text: string }) {
    return (
        <div
            className="flex h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            <div
                className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm px-8 py-6 shadow-2xl">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
                    <Loader2 className="relative h-10 w-10 animate-spin text-blue-500"/>
                </div>
                <p className="text-lg font-medium text-zinc-200">{text}</p>
            </div>
        </div>
    );
}

// Join Screen Component
function JoinScreen({onJoin, isJoining}: { onJoin: () => void; isJoining: boolean }) {
    return (
        <div
            className="flex h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            <div
                className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                    {/* Logo/Icon */}
                    <div className="mb-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 p-4 shadow-lg">
                        <Video className="h-12 w-12 text-white"/>
                    </div>

                    {/* Title */}
                    <h1 className="mb-2 text-3xl font-bold text-white">Live Stream Room</h1>
                    <p className="mb-6 text-zinc-400">Join the online classroom session</p>

                    {/* Room Info */}
                    <div className="mb-8 w-full rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Room Title:</span>
                            <span className="font-mono text-blue-400">{roomId}</span>
                        </div>
                    </div>

                    {/* Join Button */}
                    <button
                        onClick={onJoin}
                        disabled={isJoining}
                        className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative flex items-center justify-center gap-2">
                            {isJoining ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin"/>
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <Phone className="h-5 w-5"/>
                                    Join Live Stream
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Video Layout Component
function VideoLayout({onLeave}: { onLeave: () => void }) {
    const {useCallCallingState} = useCallStateHooks();
    const callingState = useCallCallingState();

    // Nếu call ended hoặc left, gọi onLeave
    useEffect(() => {
        if (callingState === CallingState.LEFT || callingState === CallingState.ENDED) {
            onLeave();
        }
    }, [callingState, onLeave]);

    if (callingState !== CallingState.JOINED) {
        return <LoadingScreen text="Connecting to room..."/>;
    }

    return (
        <div className="relative h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            {/* Main Video Area */}
            <div className="h-full w-full">
                <SpeakerLayout/>
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-lg p-3 shadow-2xl">
                    <CallControls/>
                </div>
            </div>

            {/* Room Info Overlay */}
            <div
                className="absolute left-4 top-4 rounded-lg border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5">
                <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-zinc-300">Live</span>
                    <span className="text-zinc-500">•</span>
                    <span className="font-mono text-xs text-zinc-400">{roomId}</span>
                </div>
            </div>

            {/* Participants Count */}
            <div
                className="absolute right-4 top-4 rounded-lg border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5">
                <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-zinc-400"/>
                    <span className="text-zinc-300">Live Session</span>
                </div>
            </div>

            {/* Leave Button */}
            <button
                onClick={onLeave}
                className="absolute right-4 bottom-6 rounded-lg border border-red-800 bg-red-900/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-800 hover:text-white flex items-center gap-2"
            >
                <LogOut className="h-4 w-4"/>
                Leave Room
            </button>
        </div>
    );
}

// Main Page Component
export default function Page() {
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [showJoinScreen, setShowJoinScreen] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const initialized = useRef(false);

    const handleJoin = async () => {
        if (initialized.current) return;

        initialized.current = true;
        setIsJoining(true);

        let videoClient: StreamVideoClient;

        try {
            // const userId = `user-${Date.now()}`;

            // Get token from backend
            const response = await axiosInstance.post(
                "http://localhost:8080/order/api/livestream",
                {title: "Live Stream Learn Master Website"},
            );


            console.log(response.data);
            const data = response.data
            // Create client
            videoClient = new StreamVideoClient({
                apiKey,
                token: data.token,
                user: {
                    id: data.professorId,
                    name: "Teacher",
                    image: "https://i.pravatar.cc/150?img=12",
                },
            });

            // Create/Join room
            const videoCall = videoClient.call("default", data.roomId);
            await videoCall.join({create: true});

            setClient(videoClient);
            setCall(videoCall);
            setShowJoinScreen(false);
        } catch (error) {
            console.error("JOIN CALL ERROR:", error);
            initialized.current = false;
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeave = async () => {
        try {
            await axiosInstance.delete(
                "http://localhost:8080/order/api/delete-livestream",
            );

            if (call) {
                try {
                    await call.leave();
                } catch (error) {
                    console.log("Call already left");
                }
            }
            await client?.disconnectUser();
            setClient(null);
            setCall(null);
            setShowJoinScreen(true);
            initialized.current = false;
        } catch (error) {
            console.error("LEAVE ERROR:", error);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [client]);

    if (showJoinScreen) {
        return <JoinScreen onJoin={handleJoin} isJoining={isJoining}/>;
    }

    if (!client || !call) {
        return <LoadingScreen text="Initializing live stream..."/>;
    }

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <StreamTheme>
                    <VideoLayout onLeave={handleLeave}/>
                </StreamTheme>
            </StreamCall>
        </StreamVideo>
    );
}