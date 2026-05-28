"use client"
import React, {useEffect, useRef, useState} from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";
import Chatinput from "../../../../shared/components/chats/chatinput";
import useProfessor from "../../../../hooks/useProfessor";
import {useWebSocket} from "../../../../context/web-socket-context";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import axiosInstance from "../../../../utils/axiosInstance";

const ChatPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const {professor, isLoading: professorLoading} = useProfessor();
    const queryClient = useQueryClient();
    const {ws} = useWebSocket();

    const conversationId = searchParams.get("conversationId")
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [message, setMessage] = useState("");
    const [hasFetchedOne, setHasFetchedOne] = useState(false);


    // useEffect(() => {
    //     const conversationId = searchParams.get("conversationId")
    //     const chat = chats.find(c => c.id == conversationId);
    //     setSelectedChat(chat || null)
    //
    // }, [searchParams, chats])

    const {data: messages = []} = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            if (!conversationId || hasFetchedOne) return []
            const res = await axiosInstance.get(
                `/chatting/api/get-professor-messages/${conversationId}?page=1`
            )
            setHasFetchedOne(true)
            return res.data.messages.reverse()
        },
        enabled: !!conversationId,
        staleTime: 2 * 60 * 1000
    })
    const {data: conversations, isLoading} = useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const res = await axiosInstance.get(
                "/chatting/api/get-professor-conversations",
            )
            return res.data.conversations;
        }
    })
    useEffect(() => {
        if (!conversationId || messages.length == 0) {
            return
        }
        const timeout = setTimeout(scrollToBottom, 100)
        return () => clearTimeout(timeout)
    }, [conversationId, messages.length]);
    useEffect(() => {
        if (conversationId && chats.length > 0) {
            const chat = chats.find((c: any) => c.conversationId === conversationId);
            console.log("chat", chat)
            setSelectedChat(chat || null)
        }
    }, [conversationId, chats]);
    useEffect(() => {
        if (conversations) setChats(conversations);
    }, [conversations]);
    useEffect(() => {
        if (!ws) return;
        ws.onmessage = (event: any) => {
            const data = JSON.parse(event.data);
            console.log(data)
            if (data.type === "NEW_MESSAGE") {
                const newMsg = data?.payload;
                if (newMsg.conversationId === conversationId) {
                    queryClient.setQueryData(["messages", conversationId],
                        (old: any = []) => [
                            ...old,
                            {
                                content: newMsg.messageBody || newMsg.content || "",
                                senderType: newMsg.senderType,
                                seen: false,
                                createdAt: newMsg.createdAt || new Date().toISOString(),
                            }
                        ]
                    )
                    scrollToBottom()
                }
                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat.conversationId == newMsg.conversationId
                            ? {...chat, lastMessage: newMsg.content}
                            : chat
                    )
                )
            }
            if (data.type === "UNSEEN_COUNT_UPDATE") {
                const {conversationId, count} = data.payload;
                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat.conversationId === conversationId
                            ? {...chat, unreadCount: count}
                            : chat
                    )
                )
            }
        }
    }, [ws, conversationId]);
    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                const container = messageContainerRef.current
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 50)
        })
    }
    const handleChatSelect = (chat: any) => {
        setHasFetchedOne(false)

        setChats((prev) =>
            prev.map((c) =>
                c.conversationId == chat.conversationId ? {...c, unreadCount: 0} : c
            )
        )
        router.push(`?conversationId=${chat.conversationId}`)
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "MARK_AS_SEEN",
                conversationId: chat.conversationId,
            }))
        }
    }

    const handleSend = async (e: any) => {
        e.preventDefault();
        console.log("send", message);
        console.log("selectedChat", selectedChat);

        if (!message.trim() || !selectedChat) return;
        const payload = {
            fromUserId: professor.id,
            toUserId: selectedChat.user.id,
            messageBody: message,
            conversationId: selectedChat.conversationId,
            senderType: "professor",
        }

        console.log("payload", payload)
        ws?.send(JSON.stringify(payload))
        setMessage("")
        scrollToBottom()
    }


    return (
        <div className={"w-full"}>
            <div className={"flex h-screen shadow-inner overflow-hidden bg-gray-950"}>
                <div className={'w-[320px] border-r border-gray-800 bg-gray-950 '}>
                    <div className={"p-5 border-b border-gray-800  text-lg font-semibold text-white "}>
                        Message
                    </div>
                    <div className={"divide-y divide-gray-900"}>
                        {
                            isLoading ? (
                                <div className={"py-5 text-sm text-center"}>
                                    Loading...
                                </div>
                            ) : chats.length === 0 ? (
                                <div className={"py-5 text-sm text-center"}>
                                    No conversations
                                </div>
                            ) : (
                                chats.map((chat: any) => {
                                    const isActive = selectedChat?.conversationId == chat.conversationId;
                                    return (
                                        <button key={chat.conversationId}
                                                onClick={() => handleChatSelect(chat)}
                                                className={`w-full text-left px-4 py-3 transition ${isActive
                                                    ? "bg-blue-950"
                                                    : "hover:bg-gray-800"}`}>
                                            <div className={"flex items-center gap-3"}>
                                                <Image
                                                    src={chat.user?.avatar || "https://ik.imagekit.io/trandat/products/product-1777042061276_MdcgHiWIc.jgg"}
                                                    alt={chat.user?.name || ""}
                                                    width={36} height={36}
                                                    className={"rounded-full border  w-[40px]  object-cover"}
                                                />
                                            </div>
                                            <div className={"flex-1"}>
                                                <div className={"flex items-center justify-between"}>
                                                            <span className={"text-sm font-semibold text-white"}>
                                                                {chat.user?.name}
                                                            </span>
                                                    {
                                                        chat.user?.isOnline && (
                                                            <span
                                                                className={"w-2 h-2 rounded-full bg-green-500"}/>
                                                        )
                                                    }
                                                </div>
                                                <div className={"flex items-center justify-between"}>
                                                    <p className={"text-xs text-gray-400 truncate max-w-[170px]"}>
                                                        {chat.lastMessage || ""}
                                                    </p>
                                                    {
                                                        chat?.unreadCount > 0 && (
                                                            <span className={"ml-2 text-[10px] bg-blue-600 text-white"}>
                                                                    {chat?.unreadCount}
                                                                </span>
                                                        )
                                                    }
                                                </div>

                                            </div>
                                        </button>
                                    )
                                })
                            )
                        }
                    </div>
                </div>
                {/*Chat Content*/}
                <div className={"flex flex-col flex-1 bg-gray-950"}>
                    {
                        selectedChat ? (
                            <>
                                {/*Header*/}
                                <div
                                    className={"p-4 border-b border-b-gray-800 bg-gray-900 flex items-center gap-3"}>
                                    <Image
                                        src={selectedChat.user?.avatar || "https://ik.imagekit.io/trandat/products/product-1777042061276_MdcgHiWIc.jgg"}
                                        alt={selectedChat.user?.name || ""}
                                        width={40}
                                        height={40}
                                        className={"rounded-full border  w-[40px] h-[40px] object-cover border-gray-200"}
                                    />
                                    <div>
                                        <h2 className={"text-white font-semibold text-base"}>
                                            {
                                                selectedChat.user?.name
                                            }
                                        </h2>
                                        <p className={"text-xs text-gray-400 "}>
                                            {selectedChat.user?.isOnline ? "Online" : "Offline"}
                                        </p>

                                    </div>
                                </div>
                                {/*Message*/}
                                <div
                                    ref={messageContainerRef}
                                    className={"flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm"}
                                >
                                    {
                                        messages.map((msg: any, idx: any) =>
                                            (<div key={idx}
                                                  className={`flex flex-col ${
                                                      msg.senderType == "professor"
                                                          ? "items-end ml-auto"
                                                          : "items-start"
                                                  } max-w-[80%]`}>
                                                <div className={`${msg.from == "professor"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-800 text-gray-200"
                                                } px-4 py-2 rounded-lg shadow-sm w-fit`}>
                                                    {msg.content}
                                                </div>
                                                <div
                                                    className={`text-[11px] text-gray-400 mt-1 flex items-center gap-3 ${
                                                        msg.senderType == "professor" ? "mr-1 justify-end" : "ml-1"
                                                    }`}>
                                                    {
                                                        new Date(msg.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                    }
                                                </div>
                                            </div>)
                                        )
                                    }

                                </div>
                                <Chatinput message={message}
                                           setMessage={setMessage}
                                           onSendMessage={handleSend}
                                />
                            </>
                        ) : (
                            <div className={"flex-1  flex items-center justify-center text-gray-400 text-sm"}>
                                Select a conversation to start chatting
                            </div>
                        )
                    }
                </div>

            </div>

        </div>
    )
}

export default ChatPage;