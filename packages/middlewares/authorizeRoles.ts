import {NextFunction, Response} from 'express';

import {AuthError} from "../error-handler"

export const isProfessor = (req: any, res: Response, next: NextFunction) => {
    if (req.role != "professor") {
        return next(new AuthError("access denied : Professor only"))
    }
    next()
}
export const isAdmin = (req: any, res: Response, next: NextFunction) => {
    if (req.role != "admin") {
        return next(new AuthError("access denied : Admin only"))
    }
    next()
}

export const isUser = (req: any, res: Response, next: NextFunction) => {
    if (req.role != "user") {
        return next(new AuthError("access denied : Professor only"))
    }
    next()

}
