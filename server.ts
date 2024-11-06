import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";

const startServer = async () => {
  const PORT = config.port || 3000;

  //Connect Database...
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server connected on PORT: ${PORT}`);
  });
};

startServer();
