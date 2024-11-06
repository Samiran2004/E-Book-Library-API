import { model, Schema } from "mongoose";
import { IUser } from "../user/userModel";

export interface IBook {
    _id: string;
    title: string;
    author: IUser;
    genre: string;
    coverImage: string;
    file: string;
    createdAt: Date;
    updatedAt: Date;
}

const bookSchema = new Schema<IBook>({
    title: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Book = model<IBook>('Book', bookSchema);
export default Book;