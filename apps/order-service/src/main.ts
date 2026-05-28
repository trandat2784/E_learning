/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import router from "./routes/order.route";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
    cors({
        origin: ['http://localhost:3000'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        credentials: true,
    })
);
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use('/api', router);
const port = process.env.PORT || 6003;
const server = app.listen(port, () => {
    console.log(`Listening at http://loc    alhost:${port}/api`);
});
server.on('error', console.error);
