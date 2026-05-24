/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import {errorMiddleware} from "../../../packages/error-handler/error-middleware";
import router from "./routes/admin.route";
import cors from "cors";
import cookieParser = require("cookie-parser");

const app = express();
app.use(
    cors({
        origin: ['http://localhost:3000'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        credentials: true,
    })
);
app.use(express.json())
app.use(cookieParser())
app.get('/', (req, res) => {
    res.send({message: 'Welcome to admin-service!'});
});

//route
app.use("/api", router)

app.use(errorMiddleware);

const port = process.env.PORT || 6005;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
