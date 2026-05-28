/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import router from "./routes/recommendation.route";
import cookieParser = require("cookie-parser");

const app = express();
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.get('/', (req, res) => {
    res.send({message: 'Welcome to recommendation-service!'});
});
//routes
app.use("/api", router)
const port = process.env.PORT || 6007;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
