import {kafka} from "../../../packages/utils/kafka";
import {Consumer, EachMessagePayload} from "kafkajs";
import {clearTimeout} from "node:timers";
import prisma from "../../../packages/libs/prisma";

import {incrementUnseenCount} from "../../../packages/libs/redis/message.redis";

interface BufferedMessage {
    conversationId: string,
    senderId: string,
    senderType: string,
    content: string,
    createdAt: string,
}

const TOPIC = "chat.new_message"
const GROUP_ID = "chat-message-db-writer"
const BATCH_INTERVAL_MS = 3000;
let buffer: BufferedMessage[] = []
let flushTimer: NodeJS.Timeout | null = null;

//Initialize Kafka consumer
export async function startConsumer() {
    const consumer: Consumer = kafka.consumer({groupId: GROUP_ID});
    await consumer.connect();
    await consumer.subscribe({topic: TOPIC, fromBeginning: false});
    console.log(`Kafka consumer connected and subscribed to ${TOPIC} `);
    await consumer.run({
        eachMessage: async ({message}: EachMessagePayload) => {
            if (!message.value) return
            try {
                const parsed: BufferedMessage = JSON.parse(message.value.toString())
                buffer.push(parsed)
                //if this is first message in an empty array then start the timer
                if (buffer.length == 1 && !flushTimer) {
                    flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS)
                }
            } catch (error) {
                console.error("Failed to parse kafka message", error)
            }
        }

    })
}

async function flushBufferToDb() {
    const toInsert = buffer.splice(0, buffer.length)
    if (flushTimer) {
        clearTimeout(flushTimer)
        flushTimer = null
    }
    if (toInsert.length == 0) return
    try {
        console.log("msg", toInsert)
        const prismaPayload = toInsert.map(msg => ({
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            senderType: msg.senderType,
            content: msg.content,
            createdAt: new Date(msg.createdAt),
        }))
        await prisma.message.createMany({
            data: prismaPayload,
        })
        // Redis unseen counter (only if DB insert successful)
        for (const msg of prismaPayload) {
            const receiverType = msg.senderType == "user" ? "professor" : "user"
            await incrementUnseenCount(receiverType, msg.conversationId)
        }
        console.log(`Flush ${prismaPayload.length} message to DB and redis`)
    } catch (error) {
        console.error("Failed to parse kafka message", error)
        buffer.unshift(...toInsert)
        if (!flushTimer) {
            flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS)
        }
    }
}