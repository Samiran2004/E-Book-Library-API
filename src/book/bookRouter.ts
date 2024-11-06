import express from 'express';
import { createNewBook, deleteBook, getAllBooks, getBook, updateBook } from './bookController';
import multer from 'multer';
import path from 'node:path';
import authentication from '../middlewares/autth';
import { asyncHandler } from '../utils/asyncHandler';

const bookRouter = express.Router();

const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/uploads'),
    limits: { fileSize: 1e7 }  //30mb:  30*1024*1024
})

bookRouter.get('/', getAllBooks);

bookRouter.post('/', authentication, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), createNewBook);

bookRouter.get('/:bookid', getBook);

bookRouter.delete('/:bookid', authentication, deleteBook);

bookRouter.patch('/:bookid', authentication, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), asyncHandler(updateBook));

export default bookRouter;