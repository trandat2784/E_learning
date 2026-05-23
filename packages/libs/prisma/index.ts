import dotenv from 'dotenv'
import {PrismaClient} from "../../../generated/prisma/client.js";

dotenv.config()
const prisma = new PrismaClient();

export default prisma;