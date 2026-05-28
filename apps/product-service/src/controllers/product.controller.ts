import {NextFunction, Request, Response} from "express";
import prisma from "../../../../packages/libs/prisma";
import {AuthError, NotFoundError, ValidationError} from "../../../../packages/error-handler";
import {imagekit} from "../../../../packages/libs/imagekit";
import {Prisma} from "../../../../generated/prisma/client";

export const createLesson = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {courseId} = req.params;
        console.log("courseId", courseId)
        const {
            title,
            description,
            video_url,
            duration,
            order,
            isPublished
        } = req.body;

        // Kiểm tra course có tồn tại không
        const course = await prisma.courses.findUnique({
            where: {id: courseId},
            include: {Class: true}
        });

        if (!course) {
            return next(new ValidationError("Course not found"));
        }

        // Tìm order lớn nhất hiện tại để gán order mới nếu không có
        let lessonOrder = order;
        if (!lessonOrder) {
            const lastLesson = await prisma.lesson.findFirst({
                where: {courseId},
                orderBy: {order: 'desc'}
            });
            // Xử lý trường hợp order là null
            lessonOrder = (lastLesson?.order ?? 0) + 1;
        }
        console.log("course", course);
        console.log("lessonOrder", lessonOrder);
        console.log("data lesson", req.body)

        // Tạo course mới
        const lesson = await prisma.lesson.create({
            data: {
                title,
                description,
                video_url,
                duration: duration ? parseInt(duration) : null,
                order: lessonOrder,
                isPublished: isPublished !== undefined ? isPublished : true,
                courseId,
                views: 0
            }

        })

        res.status(200).json({lesson, success: true});
    } catch (error) {
        return next(error);
    }
};


export const createCourse = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            short_description,
            detailed_description,
            custom_specifications,
            tags,
            category,
            discountCodes,
            sale_price,
            regular_price,
            subCategory,
            image_url = []
        } = req.body

        if (
            !title ||
            !short_description ||
            !category ||
            !subCategory ||
            sale_price == null ||
            !image_url ||
            !tags ||
            regular_price == null
        ) {
            return next(new ValidationError("Missing required property"))
        }
        if (!req.professor.id) {
            return next(new AuthError("Only professors can create "))
        }


        const newCourse = await prisma.courses.create({
            data: {
                title,
                short_description,
                detailed_description,
                classId: req.professor?.class?.id!,
                tags: Array.isArray(tags) ? tags : tags.split(","),
                category,
                subCategory,
                discount_codes: discountCodes.map((codeId: string) => codeId),
                sale_price: parseFloat(sale_price),
                regular_price: parseFloat(regular_price),
                custom_specifications: custom_specifications || {},
                image_url
            }
        })
        res.status(200).json({success: true, newCourse})
    } catch (error) {
        next(error)
    }
}


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

// get logged in professor courses
export const getClassCourses = async (req: any, res: Response, next: NextFunction) => {
    try {
        const courses = await prisma.courses.findMany(
            {
                where: {classId: req?.professor?.class?.id},

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
            where: {id: req.params.id!},
            include: {

                Class: true,
                videos: {
                    where: {isDeleted: false, isPublished: true},
                    orderBy: {order: 'asc'},
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        order: true,
                        video_url: true,
                    }
                }
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
    } catch (error) {
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

// Tạo course mới cho một course

// Lấy tất cả lessons của một course
export const getLessonsByCourse = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {courseId} = req.params;

        // Kiểm tra course tồn tại
        const course = await prisma.courses.findUnique({
            where: {id: courseId}
        });

        if (!course) {
            return next(new ValidationError("Course not found"));
        }

        // Lấy tất cả lessons của course, sắp xếp theo order
        const lessons = await prisma.lesson.findMany({
            where: {
                courseId,
                isDeleted: false
            },
            orderBy: {order: 'asc'}
        });

        res.status(200).json({lessons, success: true});
    } catch (error) {
        return next(error);
    }
};

// upload video

export const uploadVideo = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        const {file, fileName} = req.body;
        console.log("upload")
        const response = await imagekit.upload({
            file,
            fileName,
            folder: "/course-videos",
        });
        console.log("upload video course", response);
        res.json({
            video_url: response.url,
            fileId: response.fileId,
            duration: response.duration
        });

    } catch (e) {

        console.log(e);

        res.status(500).json({
            message: "Upload failed"
        });
    }
};
export const deleteCourseVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {fileId} = req.body
        console.log("fileId to delete video", fileId)
        const response = await imagekit.deleteFile(fileId)
        res.status(201).json({success: true, response})
    } catch (error) {
        next(error)
    }
}
// Lấy chi tiết một course
export const getLessonById = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {lessonId} = req.params;

        const lesson = await prisma.lesson.findUnique({
            where: {id: lessonId, isDeleted: false},
            include: {
                course: {
                    include: {Class: true}
                }
            }
        });

        if (!lesson) {
            return next(new ValidationError("Lesson not found"));
        }

        // Tăng view count khi xem course
        await prisma.lesson.update({
            where: {id: lessonId},
            data: {views: {increment: 1}}
        });

        res.status(200).json({lesson, success: true});
    } catch (error) {
        return next(error);
    }
};

// Cập nhật course
export const updateLesson = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {lessonId} = req.params;
        const {
            title,
            description,
            video_url,
            duration,
            order,
            isPublished
        } = req.body;

        // Kiểm tra course tồn tại
        const existingLesson = await prisma.lesson.findUnique({
            where: {id: lessonId, isDeleted: false},
            include: {
                course: {
                    include: {Class: true}
                }
            }
        });

        if (!existingLesson) {
            return next(new ValidationError("Lesson not found"));
        }

        // Kiểm tra quyền (professor của class)
        const classInfo = await prisma.classes.findFirst({
            where: {
                id: existingLesson.course.classId,
                professorId: req.professor.id
            }
        });

        if (!classInfo) {
            return next(new ValidationError("You don't have permission to update this course"));
        }

        // Nếu cập nhật order, cần reorder các lessons khác
        if (order && order !== existingLesson.order) {
            if (order > existingLesson.order) {
                // Di chuyển xuống: các course ở giữa tăng order lên 1
                await prisma.lesson.updateMany({
                    where: {
                        courseId: existingLesson.courseId,
                        order: {gt: existingLesson.order, lte: order},
                        isDeleted: false
                    },
                    data: {order: {decrement: 1}}
                });
            } else if (order < existingLesson.order) {
                // Di chuyển lên: các course ở giữa giảm order xuống 1
                await prisma.lesson.updateMany({
                    where: {
                        courseId: existingLesson.courseId,
                        order: {gte: order, lt: existingLesson.order},
                        isDeleted: false
                    },
                    data: {order: {increment: 1}}
                });
            }
        }

        // Cập nhật course
        const updatedLesson = await prisma.lesson.update({
            where: {id: lessonId},
            data: {
                title: title || existingLesson.title,
                description: description !== undefined ? description : existingLesson.description,
                video_url: video_url || existingLesson.video_url,
                duration: duration ? parseInt(duration) : existingLesson.duration,
                order: order || existingLesson.order,
                isPublished: isPublished !== undefined ? isPublished : existingLesson.isPublished
            }
        });

        res.status(200).json({lesson: updatedLesson, success: true});
    } catch (error) {
        return next(error);
    }
};

// Xóa course (soft delete)
export const deleteLesson = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {lessonId} = req.params;

        // Kiểm tra course tồn tại
        const existingLesson = await prisma.lesson.findUnique({
            where: {id: lessonId, isDeleted: false},
            include: {
                course: {
                    include: {Class: true}
                }
            }
        });

        if (!existingLesson) {
            return next(new ValidationError("Lesson not found"));
        }

        // Kiểm tra quyền
        const classInfo = await prisma.classes.findFirst({
            where: {
                id: existingLesson.course.classId,
                professorId: req.professor.id
            }
        });

        if (!classInfo) {
            return next(new ValidationError("You don't have permission to delete this course"));
        }

        // Soft delete course
        const deletedLesson = await prisma.lesson.update({
            where: {id: lessonId},
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });

        // Reorder các lessons còn lại (giảm order của các course phía sau)
        await prisma.lesson.updateMany({
            where: {
                courseId: existingLesson.courseId,
                order: {gt: existingLesson.order},
                isDeleted: false
            },
            data: {order: {decrement: 1}}
        });

        res.status(200).json({
            message: "Lesson deleted successfully",
            lesson: deletedLesson,
            success: true
        });
    } catch (error) {
        return next(error);
    }
};

// Xóa course vĩnh viễn (hard delete)
export const permanentDeleteLesson = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {lessonId} = req.params;

        const existingLesson = await prisma.lesson.findUnique({
            where: {id: lessonId},
            include: {
                course: {
                    include: {Class: true}
                }
            }
        });

        if (!existingLesson) {
            return next(new ValidationError("Lesson not found"));
        }

        // Kiểm tra quyền
        const classInfo = await prisma.classes.findFirst({
            where: {
                id: existingLesson.course.classId,
                professorId: req.professor.id
            }
        });

        if (!classInfo) {
            return next(new ValidationError("You don't have permission to delete this course"));
        }

        // Lưu lại courseId và order trước khi xóa
        const courseId = existingLesson.courseId;
        const currentOrder = existingLesson.order ?? 0; // Xử lý null

        // Hard delete
        await prisma.lesson.delete({
            where: {id: lessonId}
        });

        // Reorder (chỉ chạy nếu order không phải null)
        if (existingLesson.order !== null) {
            await prisma.lesson.updateMany({
                where: {
                    courseId: courseId,
                    order: {gt: currentOrder},
                    isDeleted: false
                },
                data: {order: {decrement: 1}}
            });
        }

        res.status(200).json({
            message: "Lesson permanently deleted",
            success: true
        });
    } catch (error) {
        return next(error);
    }
};


// Reorder lessons (batch update)
export const reorderLessons = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {courseId} = req.params;
        const {lessonOrders} = req.body; // [{id: "lessonId", order: 1}, ...]

        // Kiểm tra course
        const course = await prisma.courses.findUnique({
            where: {id: courseId},
            include: {Class: true}
        });

        if (!course) {
            return next(new ValidationError("Course not found"));
        }

        // Kiểm tra quyền
        const classInfo = await prisma.classes.findFirst({
            where: {
                id: course.classId,
                professorId: req.professor.id
            }
        });

        if (!classInfo) {
            return next(new ValidationError("You don't have permission to reorder lessons in this course"));
        }

        // Cập nhật từng course
        const updates = lessonOrders.map((item: any) =>
            prisma.lesson.update({
                where: {id: item.id},
                data: {order: item.order}
            })
        );

        await prisma.$transaction(updates);

        const updatedLessons = await prisma.lesson.findMany({
            where: {courseId, isDeleted: false},
            orderBy: {order: 'asc'}
        });

        res.status(200).json({lessons: updatedLessons, success: true});
    } catch (error) {
        return next(error);
    }
};
