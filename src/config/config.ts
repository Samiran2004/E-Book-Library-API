import dotenv from "dotenv";
dotenv.config();

const _config = {
  port: process.env.PORT,
  DBURI: process.env.DB_URI,
  env: process.env.NODE_ENV,
  JWTsecret: process.env.JWT_SECRET as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN
};

export const config = Object.freeze(_config);
