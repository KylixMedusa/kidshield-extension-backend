import cors from "cors";
import { configDotenv } from "dotenv";
import express from "express";

import Mongo from "./db";
import RedisClient from "./redis";
import router from "./routers";

configDotenv();

const app = express();

Mongo.initiateConnection()
  .then(() => {
    console.log("MongoDB connected successfully");

    const port = process.env.PORT || 3000;

    RedisClient.initiateConnection();

    app.use(
      express.json({
        limit: "50mb",
      })
    );
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    app.use(cors());

    app.use("/", router);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });
