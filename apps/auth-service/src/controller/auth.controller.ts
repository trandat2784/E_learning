import {NextFunction, Request, Response} from 'express';
import {
    checkOtpRestrictions,
    handleForgotPassword,
    sendOtp,
    trackOtpRequests,
    validateRegistrationData,
    verifyForgotPasswordOtp,
    verifyOtp,
} from '../utils/auth.helper';
import prisma from '../../../../packages/libs/prisma';
import {AuthError, ValidationError} from '../../../../packages/error-handler';
import bcrypt from 'bcryptjs';
import jwt, {JsonWebTokenError} from 'jsonwebtoken';
import {SetCookie} from '../utils/cookies/setCookie';
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
//Register a new user
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, 'user');
        const {name, email} = req.body;
        const existingUser = await prisma.users.findUnique({
            where: {email: email},
        });
        if (existingUser) {
            return next(new ValidationError('User already exists with this email'));
        }
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(name, email, 'user-activation-mail');
        res.status(200).json({
            message: 'OTP sent to email . Please verify your account',
        });
    } catch (error) {
        next(error);
    }
};

// verifying user  with otp
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp, password, name} = req.body;
        if (!email || !otp || !password || !name) {
            return next(new ValidationError('All fiels are required'));
        }
        const existingUser = await prisma.users.findUnique({
            where: {email},
        });
        if (existingUser) {
            return next(new ValidationError('User already exist with this mail '));
        }
        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.users.create({
            data: {name, email, password: hashedPassword},
        });
        res.status(201).json({message: 'User registered successfully', success: true});
    } catch (error) {
        return next(error);
    }
};

//login user
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new ValidationError('Email and password are required'));
        }
        const user = await prisma.users.findUnique({where: {email}});
        if (!user) {
            return next(new ValidationError("User doesn't exists"));
        }
        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return next(new ValidationError('Invalid email or password'));
        }
        res.clearCookie("professor-access-token");
        res.clearCookie("professor-refresh-token");
        //generate access token and refresh token
        const accessToken = jwt.sign(
            {id: user.id, role: 'user'},
            process.env.ACCESS_TOKEN_SECRET as string,
            {expiresIn: '50m'}
        );
        const refreshToken = jwt.sign(
            {id: user.id, role: 'user'},
            process.env.REFRESH_TOKEN_SECRET as string,
            {expiresIn: '7'}
        );
        //store  the fresh and access token in  an  httpOnly secure
        SetCookie(res, 'refresh_token', refreshToken);
        SetCookie(res, 'access_token', accessToken);
        res.status(200).json({
            message: 'login successfully ',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
    }
};

//refresh token
export const refreshToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies["refresh_token"] || req.cookies["professor-refresh-token"] || req.headers.authorization?.split('')[1];
        console.log("refreshToken", refreshToken);
        if (!refreshToken) {
            return new ValidationError('Unauthorized! No refresh token');
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as {
            id: string;
            role: string;
        };
        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError('Forbidden! Invalid refresh token');
        }
        let account
        if (decoded.role === 'user') {
            account = await prisma.users.findUnique({where: {id: decoded.id}});
        } else if (decoded.role === 'professor') {
            account = await prisma.professors.findUnique({
                where: {id: decoded.id},
                include: {class: true}
            });
        }
        if (!account) {
            return new AuthError('Forbidden! User/Seller not found');
        }
        const newAccessToken = jwt.sign(
            {id: decoded.id, role: decoded.role},
            process.env.ACCESS_TOKEN_SECRET as string,
            {expiresIn: '15m'}
        );
        if (decoded.role === 'user') {
            SetCookie(res, 'access_token', newAccessToken);
        } else if (decoded.role === 'professor') {
            SetCookie(res, 'professor-access-token', newAccessToken);

        }
        req.role = decoded.role;
        return res.status(201).json({success: true});
    } catch (error) {
        return next(error);
    }
};

//get User
export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

//export const userForgotPassword
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, 'user');
};

//Verify forgot password OTP
export const verifyUserForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtp(req, res, next);
};

//Reset user password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, newPassword} = req.body;
        if (!email || !newPassword) {
            return next(new ValidationError('Email and new password are required'));
        }
        const user = await prisma.users.findUnique({where: {email}});
        if (!user) {
            return next(new ValidationError('User not found'));
        }
        //compare new password with the existing one
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if (isSamePassword) {
            return next(new ValidationError('New password  can not be the same old password!'));
        }
        //hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.users.update({
            where: {email},
            data: {password: hashedPassword},
        });
        res.status(200).json({
            message: 'Password reset successfully',
        });
    } catch (error) {
        next(error);
    }
};

//log out user
export const logOutUser = async (req: any, res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(201).json({
        success: true,
    })
}

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new ValidationError('Email and new password are required'));
        }
        const user = await prisma.users.findUnique({where: {email}});
        if (!user) {
            return next(new AuthError('User does not exist'));
        }
        //verify password
        const isMatch = await bcrypt.compare(password, user.password!)
        if (!isMatch) {
            return next(new AuthError("Invalid email or passowrd"))
        }
        const isAdmin = user.role == "admin"
        // if (isAdmin) {
        //     sendLog({
        //         type: "error",
        //         message: `Admin login failed for ${email}-not an admin`,
        //         source: "auth-service",
        //     })
        //     return next(new AuthError("Invalid access"))
        // }
        // sendLog({
        //     type: "success",
        //     message: `Admin login successfully :${email}`,
        //     source: "auth-service",
        // })
        res.clearCookie("professor-access-token");
        res.clearCookie("professor-refresh-token");
        const accessToken = jwt.sign(
            {id: user.id, role: 'admin'},
            process.env.ACCESS_TOKEN_SECRET as string,
            {expiresIn: '50m'}
        );
        const refreshToken = jwt.sign(
            {id: user.id, role: 'admin'},
            process.env.REFRESH_TOKEN_SECRET as string,
            {expiresIn: '7'}
        );
        SetCookie(res, "refresh_token", refreshToken);
        SetCookie(res, 'access_token', accessToken);
        res.status(200).json({
            message: "Login successfully",
            user: {id: user.id, email: user.email, name: user.name},
        });
    } catch (error) {
        return next(error);

    }
}
//register a new seller
export const registerProfessor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Chay vao day");
        validateRegistrationData(req.body, 'professor');
        const {name, email} = req.body;
        const existingProfessor = await prisma.professors.findUnique({where: {email}});
        if (existingProfessor) {
            return new ValidationError('Professor already exists with this email');
        }
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(name, email, 'professor-activation');
        res.status(200).json({
            message: 'OTP sent to email . Please verify your account',
        });
    } catch (error) {
        next(error);
    }
};

//verify professor with otp
export const verifyProfessor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp, password, name, phone_number, country} = req.body;
        if (!email || !otp || !password || !name || !phone_number || !country) {
            return next(new ValidationError('All fiels are required'));
        }
        const existingProfessor = await prisma.professors.findUnique({
            where: {email},
        });
        if (existingProfessor) {
            return next(new ValidationError('Professor already exist with this mail '));
        }
        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password, 10);
        const professor = await prisma.professors.create({
            data: {name, email, password: hashedPassword, country, phone_number},
        });
        res.status(201).json({message: 'Professor registered successfully', professor, success: true});
    } catch (error) {
        return next(error);
    }
}
export const createClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, bio, address, opening_hours, website, category, professorId} = req.body
        console.log("create cart field", req.body);
        if (!name || !bio || !address || !opening_hours || !category || !professorId) {
            return next(new ValidationError("All fields is required"))
        }
        const classData: any = {name, bio, address, opening_hours, category, professorId}
        if (website && website.trim() != "") {
            classData.website = website;
        }
        const roomClass = await prisma.classes.create({data: classData})
        res.status(201).json({success: true, roomClass})
    } catch (error) {

    }
}

//create stripe connect account link
export const createStripeConnectLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {professorId} = req.body
        if (!professorId) {
            return next(new ValidationError("Professor Id is required"))
        }
        const professor = await prisma.professors.findUnique({
            where: {id: professorId,}
        })
        if (!professorId) {
            return next(new ValidationError("Professor is not available with this id"))
        }
        const account = await stripe.accounts.create({
            type: "express",
            email: professor?.email,
            country: "GB",
            capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true}
            }
        })
        await prisma.professors.update({
            where: {id: professorId},
            data: {
                stripeId: account.id
            }
        })
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type: "account_onboarding"
        })
        console.log(accountLink)
        res.json({url: accountLink.url})
    } catch (error) {
        return next(error)
    }
}

// login professor
export const loginProfessor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new ValidationError('Email and password are required'));
        }
        const professor = await prisma.professors.findUnique({where: {email}});
        if (!professor) {
            return next(new ValidationError("Professor doesn't exists"));
        }
        //verify password
        const isMatch = await bcrypt.compare(password, professor.password!);
        if (!isMatch) {
            return next(new ValidationError('Invalid email or password'));
        }
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        //generate access token and refresh token
        const accessToken = jwt.sign(
            {id: professor.id, role: 'professor'},
            process.env.ACCESS_TOKEN_SECRET as string,
            {expiresIn: '15m'}
        );
        const refreshToken = jwt.sign(
            {id: professor.id, role: 'professor'},
            process.env.REFRESH_TOKEN_SECRET as string,
            {expiresIn: '7'}
        );
        //store  the fresh and access token in  an  httpOnly secure
        SetCookie(res, 'professor-refresh-token', refreshToken);
        SetCookie(res, 'professor-access-token', accessToken);
        res.status(200).json({
            message: 'login successfully ',
            professor: {
                id: professor.id,
                email: professor.email,
                name: professor.name,
            },
        });
    } catch (error) {
    }
};

//get Professor
export const getProfessor = async (req: any, res: Response, next: NextFunction) => {
    try {
        const professor = req.professor;
        res.status(201).json({
            success: true,
            professor,
        });
    } catch (error) {
        next(error);
    }
};
export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        console.log("user admin get admin", user);
        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};
export const logOutAdmin = async (req: any, res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(201).json({
        success: true,
    })
}
