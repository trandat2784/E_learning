import {NextFunction, Response} from "express";
import prisma from "../../../../packages/libs/prisma";
import {AuthError, NotFoundError, ValidationError} from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import {clearUnseenCount, getUnseenCount} from "../../../../packages/libs/redis/message.redis";

export const newConversation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {professorId} = req.body;
        const userId = req.user.id
        if (!professorId) {
            return next(new ValidationError("Professor id is required"));
        }
// Directly check if a conversationGroup already exists for this user + professor
        const existingGroup = await prisma.conversationGroup.findFirst({
            where: {
                isGroup: false,
                participantIds: {
                    hasEvery: [userId, professorId]
                }
            }
        })
        if (existingGroup) {
            return res.status(200).json({
                newConversation: existingGroup, isNew: false
            })
        }
        //create converssation + participants
        const newGroup = await prisma.conversationGroup.create({
            data: {
                isGroup: false,
                creatorId: userId,
                participantIds: [userId, professorId]
            }
        })
        await prisma.participant.createMany({
            data: [
                {
                    conversationId: newGroup.id,
                    userId
                },
                {
                    conversationId: newGroup.id,
                    professorId,
                }
            ]
        })
        return res.status(200).json({conversation: newGroup, isNew: true})
    } catch (error) {
        next(error)
    }
}
//get user conversation
export const getUserConversation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id
        //find all conversationGroup where they user is a participant
        const conversations = await prisma.conversationGroup.findMany({
            where: {
                participantIds: {
                    has: userId
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        })
        const responseData = await Promise.all(
            conversations.map(async (group) => {
                const professorParticipant = await prisma.participant.findFirst({
                    where: {
                        conversationId: group.id,
                        professorId: {not: null}

                    }
                })
                //get the professor full info
                let professor = null
                if (professorParticipant?.professorId) {
                    professor = await prisma.professors.findUnique({
                        where: {
                            id: professorParticipant.professorId
                        },
                        include: {
                            class: true
                        }

                    })
                }
                //get last message in the conversation
                const lastMessage = await prisma.message.findFirst({
                    where: {
                        conversationId: group.id,
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                })
                //check online status from redis
                let isOnline = false
                if (professorParticipant?.professorId) {
                    const redisKey = `online:professor:${professorParticipant.professorId}`
                    const redisResult = await redis.get(redisKey)
                    isOnline = !!redisResult

                }
                const unreadCount = await getUnseenCount("user", group.id)
                return {
                    conversationId: group.id,
                    professor: {
                        id: professor?.id || null,
                        name: professor?.class?.name || "Unknown",
                        isOnline,
                        avatar: professor?.class?.avatar,
                    },
                    lastMessage:
                        lastMessage?.content || "Say something to start a conversation.",
                    lastMessageAt: lastMessage?.createdAt || group.updatedAt,
                    unreadCount
                }
            })
        )
        return res.status(200).json({conversations: responseData})
    } catch (error) {
        return next(error)
    }
}

//get professor conversation
export const getProfessorConversation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const professorId = req.professor.id
        //find all conversationGroup where they user is a participant
        const conversations = await prisma.conversationGroup.findMany({
            where: {
                participantIds: {
                    has: professorId
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        })
        const responseData = await Promise.all(
            conversations.map(async (group) => {
                const userParticipant = await prisma.participant.findFirst({
                    where: {
                        conversationId: group.id,
                        professorId: {not: null}

                    }
                })
                //get the user detail
                let user = null
                if (userParticipant?.userId) {
                    user = await prisma.users.findUnique({
                        where: {
                            id: userParticipant.userId
                        },
                        include: {
                            avatar: true
                        }

                    })
                }
                //get last message in the conversation
                const lastMessage = await prisma.message.findFirst({
                    where: {
                        conversationId: group.id,
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                })
                //check online status from redis
                let isOnline = false
                if (userParticipant?.userId) {
                    const redisKey = `online:user:user_${userParticipant.userId}`
                    const redisResult = await redis.get(redisKey)
                    isOnline = !!redisResult

                }
                const unreadCount = await getUnseenCount("professor", group.id)
                return {
                    conversationId: group.id,
                    professor: {
                        id: user?.id || null,
                        name: user?.name || "Unknown",
                        isOnline,
                        avatar: user?.avatar || null,
                    },
                    lastMessage:
                        lastMessage?.content || "Say something to start a conversation.",
                    lastMessageAt: lastMessage?.createdAt || group.updatedAt,
                    unreadCount
                }
            })
        )
        return res.status(200).json({conversations: responseData})
    } catch (error) {
        return next(error)
    }
}

// fetch user message
export const fetchMessages = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id
        const {conversationId} = req.params
        const page = parseInt(req.query.page as string) || 1
        const pageSize = 10
        if (!conversationId) {
            return next(new ValidationError("ConversationId is required"))
        }
        //check if user has access to this conversation
        const conversation = await prisma.conversationGroup.findUnique({
            where: {id: conversationId},
        })
        if (!conversation) {
            return next(new NotFoundError("Conversation not found"))
        }
        const hasAccess = conversation.participantIds.includes(userId)
        if (!hasAccess) {
            return next(new AuthError("Access denied to this conversation"))
        }
        // clear unseen message for this user
        await clearUnseenCount("user", conversationId)
        //get the professor participant
        const professorParticipant = await prisma.participant.findFirst({
            where: {
                conversationId,
                professorId: {not: null}
            },
        })
        //fetch professor info
        let professor = null
        let isOnline = false
        if (professorParticipant?.professorId) {
            professor = await prisma.professors.findUnique({
                where: {id: professorParticipant.professorId},
                include: {
                    class: true
                }
            })
            const redisKey = `online:professor:${professorParticipant.professorId}`
            const redisResult = await redis.get(redisKey)
            isOnline = !!redisResult
        }
        //fetch paginated message(latest first)
        const messages = await prisma.message.findMany({
            where: {conversationId},
            orderBy: {createdAt: "desc"},
            skip: (page - 1) * pageSize,
            take: pageSize
        })
        return res.status(200).json({
            messages,
            professor: {
                id: professor?.id || null,
                name: professor?.class?.name || "Unknown",
                isOnline,
                avatar: professor?.class?.avatar || null,
            },
            currentPage: page,
            hasMore: messages.length == pageSize,
        })

    } catch (error) {
        return next(error)
    }
}


//fetch professor messages
export const fetchProfessorMessages = async (req: any, res: Response, next: NextFunction) => {
    try {
        const professorId = req.professor.id
        const {conversationId} = req.params
        const page = parseInt(req.query.page as string) || 1
        const pageSize = 10
        if (!conversationId) {
            return next(new ValidationError("ConversationId is required"))
        }
        //validate access
        const conversation = await prisma.conversationGroup.findUnique({
            where: {id: conversationId},
        })
        if (!conversation) {
            return next(new NotFoundError("Conversation not found"))
        }
        if (!conversation.participantIds.includes(professorId)) {
            return next(new AuthError("Access denied to this conversation"))
        }
        // clear unseen message for this user
        await clearUnseenCount("professor", conversationId)
        //get user participant
        const userParticipant = await prisma.participant.findFirst({
            where: {
                conversationId,
                professorId: {not: null}
            },
        })
        //fetch professor info
        let user = null
        let isOnline = false
        if (userParticipant?.userId) {
            user = await prisma.users.findUnique({
                where: {id: userParticipant.userId},
                include: {
                    avatar: true
                }
            })
            const redisKey = `online:user:user_${userParticipant.userId}`
            const redisResult = await redis.get(redisKey)
            isOnline = !!redisResult
        }
        //fetch paginated message(latest first)
        const messages = await prisma.message.findMany({
            where: {conversationId},
            orderBy: {createdAt: "desc"},
            skip: (page - 1) * pageSize,
            take: pageSize
        })
        return res.status(200).json({
            messages,
            user: {
                id: user?.id || null,
                name: user?.name || "Unknown",
                isOnline,
                avatar: user?.avatar || null,
            },
            currentPage: page,
            hasMore: messages.length == pageSize,
        })

    } catch (error) {
        return next(error)
    }
}

