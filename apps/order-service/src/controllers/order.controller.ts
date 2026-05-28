import prisma from "../../../../packages/libs/prisma";
import {NextFunction, Response} from "express";
import {StreamClient} from "@stream-io/node-sdk";

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
const apiKey = "9jnkr363ckqe";
const secret =
    "47pghpdtkn63bypj3ckcexmrbba476uuvf5up6v4q4k96e3j65kz5gerj6ssz7kq";

const serverClient = new StreamClient(apiKey, secret);

export async function livestream(req: any, res: any) {
    try {
        const {title} = req.body;

        const token = serverClient.generateUserToken({
            user_id: req.professor.id,
        });
        await prisma.rooms.create({
            data: {
                title,
                professorId: req.professor.id,
                roomId: req.professor.id,
            }
        })
        return res.json({
            success: true,
            token,
            professorId: req.professor.id,
            roomId: req.professor.id,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
        });
    }
}

export const deleteLivestream = async (req: any, res: any, next: NextFunction) => {
    try {
        const roomId = req.professor.id
        console.log("RoomId to delete livestream", roomId)
        await prisma.rooms.deleteMany({where: {roomId: roomId}})
        res.status(201).json({success: true})
    } catch (error) {
        next(error)
    }

}
