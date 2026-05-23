import prisma from "../../../../packages/libs/prisma";
import {NextFunction, Response} from "express";

export const getAdminOrder = async (req: any, res: Response, next: NextFunction) => {
    try {
        const orders = await prisma.orders.findMany({
            include: {
                user: true,
                class: true
            },
            orderBy: {createdAt: "desc"}

        });
        res.status(200).json({orders, success: true});

    } catch (error) {
        next(error);
    }
}

