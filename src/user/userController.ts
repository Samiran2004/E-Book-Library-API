import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import User, { IUser } from "./userModel";
import bcrypt from 'bcrypt';
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

interface RequestBody {
    name: string;
    email: string;
    password?: string;
}

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body as RequestBody;

        if (!name || !email || !password) {
            const error = createHttpError(400, "All fields are required.");
            return next(error);
        }

        // Database call...
        const user = await User.findOne({ email: email });
        if (user) {
            const error = createHttpError(400, "User already exists with this email.");
            return next(error);
        }

        // password -> hash
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: IUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        //Token generation -> JWT
        const token = sign({
            sub: newUser._id
        }, config.JWTsecret, { expiresIn: '7d' });


        res.status(201).send({
            status: 'Success',
            message: "User created",
            id: newUser._id,
            accessToken: token
        });

    } catch (error) {
        return next(createHttpError(500, "Internal Server Error."));
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(createHttpError(400, "All fields are required."));
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return next(createHttpError(404, "User not found."));
        }

        const isMatchPassword: boolean = await bcrypt.compare(password, user.password);
        if (!isMatchPassword) {
            return next(createHttpError(400, "Username or Password incorrect!"));
        }

        //Create accesstoken
        const token = sign({
            sub: user._id
        }, config.JWTsecret, { expiresIn: '7d' });


        res.status(200).send({
            status: 'OK',
            message: "User Logged in",
            accessToken: token
        });
    } catch (error) {
        return next(createHttpError(500, "Internal Server Error"));
    }
}

export { createUser, loginUser };