import prisma from "../../../../packages/libs/prisma";

export const getUserActivity = async (userId: string) => {
    try {
        const userActivity = await prisma.userAnalytics.findUnique({
            where: {userId: userId},
            select: {actions: true},
        });
        return userActivity?.actions || [];
    } catch (error) {
        console.error("error fetching user activity", error);
        return []
    }

}