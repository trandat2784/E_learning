import redis from "./index";

export const incrementUnseenCount = async (
    receiverType: "user" | "professor",
    conversationId: string,
) => {
    const key = `unseen:${receiverType}:${conversationId}`;
    await redis.incr(key)
}
export const getUnseenCount = async (
    receiverType: "user" | "professor",
    conversationId: string
): Promise<number> => {
    const key = `unseen:${receiverType}_${conversationId}`;
    const count = await redis.get(key)
    return parseInt(count || "0")
}
export const clearUnseenCount = async (
    receiverType: "user" | "professor",
    conversationId: string
) => {
    const key = `unseen:${receiverType}_${conversationId}`;
    await redis.del(key)
}
