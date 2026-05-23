import cron from "node-cron"
import prisma from "../../../../packages/libs/prisma";

cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();
// delete products where `deletedAt` is older than 24h
        await prisma.courses.findMany({
            where: {
                isDeleted: true
                , deletedAt: {lte: now}
            },
        })

    } catch (error) {
        console.log(error);
    }
});