import {NextFunction, Request, Response} from "express";
import prisma from "../../../../packages/libs/prisma";
import {ValidationError} from "../../../../packages/error-handler";


//get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const [courses, totalCourses] = await Promise.all([
            prisma.courses.findMany({
                where: {
                    starting_date: null
                },
                skip, take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sale_price: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: {select: {url: true}, take: 1},
                    Class: {
                        select: {name: true}
                    }
                }
            }),
            prisma.courses.count({
                where: {
                    starting_date: null,
                }
            })
        ])
        const totalPages = Math.ceil(totalCourses / page);
        res.status(200).json({
            success: true,
            data: courses,
            meta: {totalCourses, currentPage: page, totalPages},

        })
    } catch (error) {
        next(error);
    }
}


export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const [events, totalEvents] = await Promise.all([
            prisma.courses.findMany({
                where: {
                    starting_date: {
                        not: null
                    }
                },
                skip, take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sale_price: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    starting_date: true,
                    ending_date: true,
                    images: {select: {url: true}, take: 1},
                    Class: {
                        select: {name: true}
                    }
                },
            }),
            prisma.courses.count({
                where: {
                    starting_date: {
                        not: null
                    }
                }
            })
        ])
        const totalPages = Math.ceil(totalEvents / page);
        res.status(200).json({
            success: true,
            data: events,
            meta: {totalEvents, currentPage: page, totalPages},

        })
    } catch (error) {
        next(error);
    }
}

export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const admins = await prisma.users.findMany({
            where: {
                role: "admin"
            }
        })
        res.status(201).json({
            success: true,
            admins: admins,
        })
    } catch (error) {
        next(error);
    }
}
// update role
export const addNewAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, role} = req.body;
        const isUser = await prisma.users.findUnique({
            where: {email},
        })
        if (!isUser) {
            return next(new ValidationError("Something went wrong"));
        }
        const updateRole = await prisma.users.update({
            where: {email},
            data: {
                role,
            }
        })
        res.status(200).json({
            success: true, updateRole
        })
    } catch (error) {
        next(error);
    }
}

export const getAllCustomizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst()
        return res.status(200).json({
            categories: config?.categories || [],
            subCategories: config?.subCategories || {},
            logo: config?.logo || null,
            banner: config?.banner || null
        })
    } catch (error) {
        return next(error);
    }
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const [users, totalUsers] = await Promise.all([
            prisma.users.findMany({
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }

            }),
            prisma.users.count()
        ])
        const totalPages = Math.ceil(totalUsers / page);
        res.status(200).json({
            success: true,
            data: users,
            meta: {
                totalUsers,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error);
    }
}


export const getAllProfessor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const [professors, totalProfessors] = await Promise.all([
            prisma.professors.findMany({
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    class: {
                        select: {
                            name: true,
                            avatar: true,
                            address: true,
                        }
                    }
                }

            }),
            prisma.professors.count()
        ])
        const totalPages = Math.ceil(totalProfessors / page);
        res.status(200).json({
            success: true,
            data: professors,
            meta: {
                totalProfessors,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error);
    }
}
