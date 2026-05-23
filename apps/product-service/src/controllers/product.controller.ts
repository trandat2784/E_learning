import {NextFunction, Request, Response} from "express";
import prisma from "../../../../packages/libs/prisma";
import {AuthError, NotFoundError, ValidationError} from "../../../../packages/error-handler";
import {imagekit} from "../../../../packages/libs/imagekit";
import {Prisma} from "../../../../generated/prisma/client";
import {error} from "next/dist/build/output/log";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst()
        if (!config) {
            return res.status(404).json({message: 'No Categories found'})

        }
        return res.status(200).json({categories: config.categories, subCategories: config.subCategories})
    } catch (error) {
        return next(error)
    }
}
// create discount codes
export const createDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {discountType, public_name, discountCode, discountValue} = req.body
        const isDiscountCodeExists = await prisma.discount_codes.findUnique({
            where: {discountCode}
        })
        if (isDiscountCodeExists) {
            return next(new ValidationError("Discount Code already available please use a different discount code"))
        }
        const discount_code = await prisma.discount_codes.create({
            data: {
                public_name, discountType, discountValue: parseFloat(discountValue),
                discountCode, professorId: req.professor.id
            }
        })
        res.status(200).json({discount_code, success: true})
    } catch (error) {
        return next(error)
    }
}
//get  discount coed
export const getDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const discount_codes = await prisma.discount_codes.findMany({
            where: {professorId: req.professor.id}
        })
        res.status(200).json({discount_codes, success: true})
    } catch (error) {
        return next(error)
    }
}
//delete discount code
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params
        const professorId = req.professor?.id
        const discountCode = await prisma.discount_codes.findUnique({
            where: {id},
            select: {id: true, professorId: true}
        })
        if (!discountCode) {
            return next(new NotFoundError("Discount Code Not Found"))
        }
        if (discountCode.professorId !== professorId) {
            return next(new ValidationError("Unauthorized access"))
        }
        await prisma.discount_codes.delete({where: {id: id}})
        return res.status(200).json({message: "Successfully deleted discount code"})
    } catch (error) {
        return next(error)
    }
}


//upload product image
export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {fileName} = req.body
        console.log(fileName)
        const response = await imagekit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jgg`,
            folder: "/products",
        });
        res.status(200).json({
            file_url: response.url,
            fileId: response.fileId
        })
    } catch (e) {
        next(e)
    }
}
export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {fileId} = req.body
        console.log("fileId to delete image", fileId)
        const response = await imagekit.deleteFile(fileId)
        res.status(201).json({success: true, response})
    } catch (error) {
        next(error)
    }
}
export const createCourse = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            short_description,
            detailed_description,
            warranty,
            custom_specifications,
            slug,
            tags,
            cash_on_delivery,
            brand,
            video_url,
            category,
            colors = [],
            sizes = [],
            discountCodes,
            stock,
            sale_price,
            regular_price,
            subCategory,
            customProperties = {},
            images = []
        } = req.body
        if (!title || !slug || !short_description || !category || !subCategory || !sale_price || !images || !tags || !stock ||
            !regular_price) {
            return next(new ValidationError("Missing required property"))
        }
        if (!req.professor.id) {
            return next(new AuthError("Only professors can create "))
        }
        const slugChecking = await prisma.courses.findUnique({where: {slug}})
        if (slugChecking) {
            return next(new ValidationError("Slug already exists,Please use a different slug"))
        }
        const newCourse = await prisma.courses.create({
            data: {
                title,
                short_description,
                detailed_description,
                warranty,
                cashOnDelivery: cash_on_delivery,
                slug,
                classId: req.professor?.class?.id!,
                tags: Array.isArray(tags) ? tags : tags.split(","),
                brand,
                video_url, category, subCategory, colors: colors || [],
                discount_codes: discountCodes.map((codeId: string) => codeId),
                sizes: sizes || [],
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price),
                regular_price: parseFloat(regular_price),
                custom_properties: customProperties || {},
                custom_specifications: custom_specifications || {},
                images: {
                    create: images.filter((img: any) => img && img.fileId && img.file_url).map((img: any) => ({
                        file_id: img.fileId,
                        url: img.file_url,
                    }))
                },
            }, include: {images: true}
        })
        res.status(200).json({success: true, newCourse})
    } catch (error) {
        next(error)
    }
}

// get logged in professor courses
export const getClassCourses = async (req: any, res: Response, next: NextFunction) => {
    try {
        const courses = await prisma.courses.findMany(
            {
                where: {classId: req?.professor?.class?.id},
                include: {images: true}
            })
        res.status(200).json({courses, success: true})
    } catch (error) {
        return next(error)
    }

}
//delete course
export const deleteCourse = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {courseId} = req.params
        const professorId = req.professor?.class?.id
        const course = await prisma.courses.findUnique(
            {
                where: {id: courseId},
                select: {id: true, classId: true, isDeleted: true}
            })
        if (!course) {
            return next(new ValidationError("Product not found"))
        }
        if (course.classId != professorId) {
            return next(new ValidationError("Unauthorized action"))
        }
        if (course.isDeleted) {
            return next(new ValidationError("Product is already deleted"))
        }
        const deletedCourse = await prisma.courses.update({
            where: {id: courseId},
            data: {isDeleted: true, deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000)},
        })
        return res.status(200).json({
            deletedAt: deletedCourse.deletedAt,
            message: "Course is  scheduled  for deletion in 24 hours . You can restore it within this",
        })
    } catch (error) {
        return next(error)

    }
}

//Restore  product
export const restoreCourse = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {courseId} = req.params
        const professorId = req.professor?.class?.id
        const course = await prisma.courses.findUnique(
            {
                where: {id: courseId},
                select: {id: true, classId: true, isDeleted: true}
            })
        if (!course) {
            return next(new ValidationError("Product not found"))
        }
        if (course.classId != professorId) {
            return next(new ValidationError("Unauthorized action"))
        }
        if (!course.isDeleted) {
            return res.status(400).json({
                message: " Course is not in deleted state"
            })
        }
        await prisma.courses.update({
            where: {id: courseId},
            data: {isDeleted: false, deletedAt: null},
        })
        return res.status(200).json({
            message: "Course successfully restored  ",
        })
    } catch (error) {
        return next(error)
    }
}

//get professor stripe information
// export const getStripeAccount = async

// get all product
export const getAllCourses = async (req: any, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20

        const skip = (page - 1) * limit
        const type = req.query.type as string
        const baseFilter = {
            // OR: [{
            //     starting_date: null
            // },
            //     {
            //         ending_date: null
            //     }
            // ],
        }
        const orderBy: Prisma.coursesOrderByWithRelationInput =
            type == "latest"
                ? {createdAt: "desc" as Prisma.SortOrder}
                : {totalSales: "desc" as Prisma.SortOrder}
        const [courses, total, top10Courses] = await Promise.all([
            prisma.courses.findMany({
                skip, take: limit,
                include: {
                    images: true,
                    Class: true
                },
                where: baseFilter,
                orderBy: {
                    totalSales: "desc",
                },
            }),
            prisma.courses.count({where: baseFilter}),
            prisma.courses.findMany({
                take: 10,
                where: baseFilter,
                orderBy
            })
        ])
        const couse = await prisma.courses.findMany({})
        console.log("course", couse)
        res.status(200).json({
            courses,
            top10By: type == "latest" ? "latest" : "topSales",
            top10Courses,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        next(error)
    }

}
//get All events
export const getAllEvents = async (req: any, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const baseFilter = {
            AND: [{starting_date: {not: null}},
                {ending_date: {not: null}},
            ]
        }
        const [events, total, top10BySales] = await Promise.all([
            prisma.courses.findMany({
                skip, take: limit,
                where: baseFilter,
                include: {images: true, Class: true},
                orderBy: {
                    totalSales: "desc",
                },
            }),
            prisma.courses.count({where: baseFilter}),
            prisma.courses.findMany({
                where: baseFilter,
                take: 10,
                orderBy: {
                    totalSales: "desc",
                }
            })
        ])

        res.status(200).json({
            events, total, top10BySales,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        res.status(400).json({message: "Failed to get events"})
    }
}

export const getCoursesDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await prisma.courses.findUnique({
            where: {slug: req.params.slug!},
            include: {
                images: true,
                Class: true,
            },


        })
        console.log("course detail", course)
        res.status(201).json({success: true, course})
    } catch (error) {
        next(error)
    }
}
export const getFilteredCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {priceRange = [0, 10000], categories = [], colors = [], sizes = [], page = 1, limit = 12} = req.query
        const parsedPriceRange =
            typeof priceRange == "string"
                ? priceRange.split(",").map(Number)
                : [0, 10000]
        const parsedPage = Number(page)
        const parsedLimit = Number(limit)
        const skip = (parsedPage - 1) * parsedLimit
        const filters: Record<string, any> = {
            sale_price: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1],
            },
            NOT:
                {starting_date: null},
        }
        if (categories && (categories as string[]).length > 0) {
            filters.category = {in: Array.isArray(categories) ? categories : String(categories).split(",")}
        }
        if (colors && (colors as string[]).length > 0) {
            filters.colors = {hasSome: Array.isArray(colors) ? colors : [colors]}
        }
        console.log(sizes)
        if (sizes && (sizes as string[]).length > 0) {
            filters.sizes = {hasSome: Array.isArray(sizes) ? sizes : [sizes]}
        }
        const [products, total] = await Promise.all([
            prisma.courses.findMany({
                where: filters,
                skip, take: parsedLimit,
                include: {
                    images: true,
                    Class: true
                },

            }),
            prisma.courses.count({where: filters})
        ])
        const totalPages = Math.ceil(total / parsedLimit)
        res.status(200).json({
            products,
            pagination: {total, page: parsedPage, totalPages}
        })
    } catch (error) {
        next(error)
    }
}

export const getFilteredEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {priceRange = [0, 10000], categories = [], colors = [], sizes = [], page = 1, limit = 12} = req.query
        const parsedPriceRange =
            typeof priceRange == "string"
                ? priceRange.split(",").map(Number)
                : [0, 10000]
        const parsedPage = Number(page)
        const parsedLimit = Number(limit)
        const skip = (parsedPage - 1) * parsedLimit
        const filters: Record<string, any> = {
            sale_price: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1],
            },
            NOT:
                {starting_date: null},
        }
        if (categories && (categories as string[]).length > 0) {
            filters.categories = {in: Array.isArray(categories) ? categories : String(categories).split(",")}
        }
        if (colors && (colors as string[]).length > 0) {
            filters.colors = {hasSome: Array.isArray(colors) ? colors : [colors]}
        }
        if (sizes && (sizes as string[]).length > 0) {
            filters.sizes = {hasSome: Array.isArray(sizes) ? sizes : [sizes]}
        }
        const [products, total] = await Promise.all([
            prisma.courses.findMany({
                where: filters,
                skip, take: parsedLimit,
                include: {
                    images: true,
                    Class: true
                },

            }),
            prisma.courses.count({where: filters})
        ])
        const totalPages = Math.ceil(total / parsedLimit)
        res.status(200).json({
            products,
            pagination: {total, page: parsedPage, totalPages}
        })
    } catch (error) {
        next(error)
    }
}

export const getFilteredClasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {categories = [], countries = [], page = 1, limit = 12} = req.query
        const parsedPage = Number(page)
        const parsedLimit = Number(limit)
        const skip = (parsedPage - 1) * parsedLimit
        const filters: Record<string, any> = {}
        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) ? categories : String(categories).split(","),
            }
        }
        if (countries && (countries as string[]).length > 0) {
            filters.countries = {in: Array.isArray(countries) ? countries : String(countries).split(",")}
        }
        const [classes, total] = await Promise.all([
            prisma.classes.findMany({
                where: filters,
                skip, take: parsedLimit,
                include: {
                    professors: true,

                    courses: true
                },

            }),
            prisma.classes.count({where: filters})
        ])
        const totalPages = Math.ceil(total / parsedLimit)
        res.json({classes, pagination: {total, page: parsedPage, totalPages}})
    } catch (e) {
        next(error)
    }
}
export const searchCourses =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query.q as string
            if (!query || query.trim().length == 1) {
                return res.status(400).json({message: "Search query is  required"})
            }
            const courses = await prisma.courses.findMany({
                where: {
                    OR: [{
                        title: {contains: query, mode: "insensitive"}
                    }, {
                        short_description: {contains: query, mode: "insensitive"}
                    }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                }, take: 10,
                orderBy: {createdAt: "desc"}
            })
            return res.status(200).json({courses})
        } catch (error) {
            return next(error)
        }
    }
// export const topClasses= async (req:Request,res:Response,next:NextFunction)=>{
//     try {
//         //aggregate total sales per class from orders
//         const topClassesData = await prisma.orders.groupBy({
//             by:["classId"],
//             _sum:{
//                 total:true
//             },
//             orderBy:{
//                 _sum:{
//                     total:"desc"
//                 }
//             },
//             take:10
//         })
// const classIds = topClassesData.map((item) => item.classId)
// const classes = await prisma.classes.findMany({
//     where: {
//         id:{
//             in:classIds
//         },
//     },
//     select: {
//         id: true,
//         name: true,
//         avatar: true,
//         coverBanner: true,
//         address: true,
//         ratings: true,
//         followers: true,
//         category:true,
//     }
// })
//         const enrichedClasses = classes.map((item) => {
//             const saleData =topClassesData.find((s)=>s.classId==class.id)
//             return {
//                 ...class,
//                 totalSales:saleData?._sum.total??0
//             }
//         })
//         const top10Classes = enrichedClasses
//             .sort((a,b)=>b.totalSales - a.totalSales)
//             .slice(0,10)
//         return res.status(200).json({classes:top10Classes})
//     }
//     catch(error){
//       console.log(error)
//         return next(error)
//     }
// }
//


