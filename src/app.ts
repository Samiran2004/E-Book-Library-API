import express, {
  Request,
  Response,
} from "express";

import errorHandler from "./middlewares/globalErrorHandler";
import createHttpError from "http-errors";
import cors from 'cors';
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import { config } from "./config/config";

const app = express();

app.use(express.json());
app.use(cors({
  origin: config.FRONTEND_DOMAIN
}))
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/work", (req: Request, res: Response) => {
  try {
    res.status(200).send({
      status: 'Success',
      message: "API Working"
    });
  } catch (err) {
    console.log(err);
    const error = createHttpError(500, "Internal Server Error");
    throw error;
  }
});

// users endpoint
app.use('/api/users', userRouter);

// books endpoint
app.use('/api/books', bookRouter);

app.use(errorHandler);

export default app;
