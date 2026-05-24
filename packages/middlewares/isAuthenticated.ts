import prisma from '../libs/prisma';
import {NextFunction, Response} from 'express';
import jwt from 'jsonwebtoken';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["access_token"] || req.cookies["professor-access-token"] || req.headers.authorization?.split('')[1];
        if (!token) {
            return res.status(401).json({message: 'Unauthorized!token missing'});
        }
        //verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: 'user' | 'professor' | 'admin';
        };
        console.log("admin decode", decoded);
        console.log(decoded);
        if (!decoded) {
            return res.status(401).json({
                message: 'Unauthorized! Invalid token',
            });
        }
        let account;
        if (decoded.role == "user") {
            account = await prisma.users.findUnique({
                where: {id: decoded.id},
            });
            req.user = account;
        } else if (decoded.role == "professor") {
            account = await prisma.professors.findUnique({
                where: {id: decoded.id},
                include: {class: true}
            });
            req.professor = account;
        } else if (decoded.role == "admin") {
            account = await prisma.users.findUnique({
                where: {id: decoded.id},
            });
            console.log("admin acount decode", account, decoded)
            req.admin = account;
        }

        if (!account) {
            return res.status(401).json({message: 'Account not found !'});
        }
        req.role = decoded.role
        return next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized! Token expired or invalid'});
    }
};
export default isAuthenticated;
