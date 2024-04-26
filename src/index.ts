import cors from "cors";
import { configDotenv } from "dotenv";
import express from "express";

import router from "./router";

configDotenv();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.use("/", router);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
