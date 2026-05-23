import express from 'express';
import cors from 'cors';
import { errorMiddleware} from "../../../packages/error-handler/error-middleware"
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from "swagger-ui-express"
import swaggerDocument from "./swagger-output.json"
const app = express();
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

// 1. MIDDLEWARE CƠ BẢN - Đặt đầu tiên
app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 2. ROUTES - Đặt ở giữa
app.get('/', (req, res) => {
  res.send({ message: 'Auth service is running' });
});
app.use("/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get("/docs-json",(req,res)=>{
  res.json({swaggerDocument})
})
//Routes
app.use('/api', router);

// 3. ERROR HANDLER - Đặt CUỐI CÙNG
app.use(errorMiddleware); // ✅ ĐẶT CUỐI CÙNG

// Server startup
const server = app.listen(port, () => {
  console.log(`Auth service is running at http://${host}:${port}`);
  console.log(`swagger docs available at http://localhost${port} `,);
});

server.on('error', (error) => {
  console.log('Server error', error);
});
