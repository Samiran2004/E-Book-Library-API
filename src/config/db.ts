import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    if (typeof config.DBURI == 'string') {
        await mongoose
            .connect(config.DBURI as string)
            .then(() => console.log("Database connected..."))
            .catch((err) => console.log("Database connection error...",err));
    } else {
        console.log("Database internal error...");
    }

    // try {
    //     await mongoose.connect(config.DBURI as string);

    //     mongoose.connection.on('connected', () => {
    //         console.log("Database connected.");
    //     });

    //     mongoose.connection.on('error', () => {
    //         console.log("Error in connecting in database.");
    //     })
    // } catch (error) {
    //     console.log("Internal Database Error.", error);
    // }
}

export default connectDB;