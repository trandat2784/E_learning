//get recommended products
import prisma from "../../../../packages/libs/prisma";
import {nextFunction, Response} from "express";

export const getRecommenedCourses = async (req: any, res: Response, next: nextFunction) => {
    try {
        const userId = req.user.id
        const courses = await prisma.courses.findMany({
            include: {images: true, Class: true}
        })
        let userAnalytics = await prisma.userAnalytics.findUnique({
            where: {userId: userId},
            select: {
                actions: true, recommendations: true,
                lastTrained: true
            }
        })
        const now = new Date()
        let recommendedCourses = []
        if (!userAnalytics) {
            recommendedCourses = courses.slice(-10)
        } else {
            const actions = Array.isArray(userAnalytics.actions)
                ? (userAnalytics.actions as any[])
                : []
            const recommendations = Array.isArray(userAnalytics.recommendations)
                ? (userAnalytics.recommendations as string[])
                : []
            const lastTrainedTime = Array.isArray(userAnalytics.recommendations)
                ? new Date(userAnalytics.lastTrained)
                : null
            const hoursDiff = lastTrainedTime
                ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60)
                : Infinity
            if (actions.length < 50) {
                recommendedCourses = courses.slice(-10)
            } else if (hoursDiff < 3 && recommendedCourses.length > 0) {
                recommendedCourses = courses.filter((course: any) => recommendedCourses.includes(course.id))
            } else {
                const recommendedCourseIds = await recommendedCourses(userId, courses)
                recommendedCourses = courses.filter((course: any) => recommendedCourseIds.includes(course.id))
                await prisma.userAnalytics.update({
                    where: {userId},
                    data: {
                        recommendations: recommendedCourseIds,
                        lastTrained: now,
                    }
                })
            }
            res.status(200).json({
                success: true,
                recommendations: recommendedCourses
            })
        }
    } catch (error) {
        return next(error)

    }

}