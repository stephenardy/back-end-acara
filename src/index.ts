import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import router from "./routes/api";
import db from "./utils/database";
import docs from "./docs/route";

async function init() {
  try {
    const PORT = 3000;
    const result = await db();

    console.log("Database status: ", result);

    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    app.use("/api", router);
    docs(app);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
