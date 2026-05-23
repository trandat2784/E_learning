import dotenv from 'dotenv'
import {PrismaClient} from "../../../../generated/prisma/client";


dotenv.config()
const prisma = new PrismaClient();
const initializeSiteConfig = async () => {
    try {
        const existingConfig = await prisma.site_config.findFirst();
        if (!existingConfig) {
            await prisma.site_config.create({
                data: {
                    categories: [
                        "Electronics",
                        "Fashions",
                        "Home & Kitchen",
                        "Sports & Fitness",

                    ],
                    subCategories: {
                        "Electronics": ["Mobiles", "Laptop", "Accessories", "Gaming"],
                        "Fashion": ["Men", "Women", "Kids", "Footwear"],
                        "Home & Kitchen": ["Furniture", "Appliances", "Decor"],
                        "Sports & Fitness": ["Gym Equipment", "Outdoor Sports", "Wearables"],
                    }
                }
            });
        }
    } catch (error) {
        console.log("error initializing site config ", error);
    }
}
export default initializeSiteConfig;