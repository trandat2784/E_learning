import express from 'express';
import cors from 'cors';
import "./jobs/product-crone.job"
import {errorMiddleware} from "../../../packages/error-handler/error-middleware"
import cookieParser from 'cookie-parser';
import router from "./routes/product.routes";

const app = express();
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

// 1. MIDDLEWARE CƠ BẢN - Đặt đầu tiên
app.use(
    cors({
        origin: ['http://localhost:3000'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        credentials: true,
    })
);
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());

// 2. ROUTES - Đặt ở giữa
app.get('/', (req, res) => {
    res.send({message: 'Product service is running'});
});

//Routes
app.use('/api', router);

// 3. ERROR HANDLER - Đặt CUỐI CÙNG
app.use(errorMiddleware); // ✅ ĐẶT CUỐI CÙNG

// Server startup
const server = app.listen(port, () => {
    console.log(`Product service is running at http://${host}:${port}`);
    // console.log(`swagger docs available at http://localhost${port} `,);
});

server.on('error', (error) => {
    console.log('Server error', error);
});
