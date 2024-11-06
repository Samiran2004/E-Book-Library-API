import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs from 'fs';
import Book, { IBook } from "./bookModel";
import { AuthRequest } from "../middlewares/autth";


const createNewBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, genre } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
        let fileName = files.coverImage[0].filename;
        let filePath = path.resolve(__dirname, '../../public/data/uploads', fileName);
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: 'book-covers',
            format: coverImageMimeType,
        });

        fs.unlink(filePath, async (err) => {
            if (err) {
                await cloudinary.uploader.destroy(uploadResult.public_id);
                return next(createHttpError(500, "Internal Server Error!"));
            }
        });

        fileName = files.file[0].filename;
        filePath = path.resolve(__dirname, '../../public/data/uploads', fileName);
        const bookFileUploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: 'raw',
            filename_override: fileName,
            folder: 'book-pdfs',
            format: 'pdf'
        });

        fs.unlink(filePath, async (err) => {
            if (err) {
                await cloudinary.uploader.destroy(uploadResult.public_id);
                return next(createHttpError(500, "Internal Server Error!"));
            }
        });

        const _req = req as AuthRequest;
        const newBook = await Book.create({
            title: title,
            genre: genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url
        });

        res.status(201).send({
            status: "OK",
            message: "New Book Created",
            data: newBook
        });
    } catch (error) {
        return next(createHttpError(500, "Internal Server Error!"));
    }
}

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, genre } = req.body;
        const bookid: string = req.params.bookid;

        const book = await Book.findOne({ _id: bookid });

        if (!book) {
            return next(createHttpError(404, "Book not found!"));
        }

        const _req = req as AuthRequest

        if (book.author.toString() !== _req.userId) {
            return next(createHttpError(403, "Unauthorized"));
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        let completeCoverImage = "";
        if (files.coverImage) {
            const filename = files.coverImage[0].filename;
            const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
            const filePath = path.resolve(__dirname, "../../public/data/uploads/" + filename);

            completeCoverImage = filename;

            const uploadResult = await cloudinary.uploader.upload(filePath, {
                filename_override: completeCoverImage,
                folder: "book-covers",
                format: coverImageMimeType
            });

            completeCoverImage = uploadResult.secure_url;

            try {
                await fs.promises.unlink(filePath);
            } catch (err) {
                await cloudinary.uploader.destroy(uploadResult.public_id);
                return next(createHttpError(500, "Internal Server Error!"));
            }

        }
        let completeFileName = "";
        if (files.file) {
            const fileName = files.file[0].filename;
            const filePath = path.resolve(__dirname, "../../public/data/uploads/" + fileName);
            completeFileName = fileName;
            const bookFileUploadResult = await cloudinary.uploader.upload(filePath, {
                resource_type: 'raw',
                filename_override: completeFileName,
                folder: 'book-pdfs',
                format: 'pdf'
            });

            completeFileName = bookFileUploadResult.secure_url;

            fs.unlink(filePath, async (err) => {
                if (err) {
                    await cloudinary.uploader.destroy(bookFileUploadResult.public_id);
                    return next(createHttpError(500, "Internal Server Error!"));
                }
            });

        }

        const updatedBook = await Book.findByIdAndUpdate(
            { _id: bookid },
            {
                title: title,
                genre: genre,
                coverImage: completeCoverImage || book.coverImage,
                file: completeFileName || book.file,
            },
            { new: true }
        );


        return res.status(201).send({
            status: 'Success',
            message: "Book Updated",
            updateData: updatedBook
        });


    } catch (error) {
        return next(createHttpError(500, "Internal Server Error!"));
    }
}

const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //Add pagination
        const books = await Book.find();

        res.status(200).send({
            status: "Success",
            data: books
        });

    } catch (error) {
        return next(createHttpError(500, "Internal Server Error!"));
    }
}

const getBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookId = req.params.bookid;
        const bookData = await Book.findOne({ _id: bookId });
        if (!bookData) {
            return next(createHttpError(404, "Book not found!"));
        }
        res.status(200).send({
            status: "Success",
            data: bookData
        })
    } catch (error) {
        return next(createHttpError(500, "Internal Server Error!"));
    }
}

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookid: string = req.params.bookid;

        const bookData: IBook | null = await Book.findById(bookid);
        if (!bookData) {
            return next(createHttpError(404, "Book not found!"));
        }

        if (bookData.author.toString() !== (req as AuthRequest).userId) {
            return next(createHttpError(403, "Unauthorized User!"));
        }

        try {
            const coverImageSplit = bookData.coverImage.split('/');
            const coverImagePublicId = coverImageSplit.at(-2) + "/"+coverImageSplit.at(-1)?.split(".").at(-2);
            await cloudinary.uploader.destroy(coverImagePublicId);
            try {
                const fileSplit = bookData.file.split('/');
                const filePublicId = fileSplit.at(-2)+"/"+fileSplit.at(-1);
                await cloudinary.uploader.destroy(filePublicId);
            } catch (error) {
                return next(createHttpError(500, "File Deletation Error!"));
            }
        } catch (error) {
            return next(createHttpError(500, "Cover Image Deletation Error!"));
        }

        await Book.findByIdAndDelete(bookid);

        res.status(200).send({
            status: "Success",
            message: "Book Deleted"
        });


    } catch (error) {
        return next(createHttpError(500, "Internal Server Error!"));
    }
}

export { createNewBook, updateBook, getAllBooks, getBook, deleteBook }