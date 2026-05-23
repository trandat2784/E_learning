import React from 'react';
import axiosInstance from "../../../../utils/axiosInstance";
import {Metadata} from "next";
import ProductDetails from "../../../shared/modules/product/product-details";

async function fetchProductDetails(slug: string) {
    const response = await axiosInstance.get(`/product/api/get-course/${slug}`);
    return response.data.course;
}

export async function generateMetadata({params,}: { params: { slug: string }; }): Promise<Metadata> {
    const resolvedParams = await params; // ✅ AWAIT ĐẦU TIÊN
    const course = await fetchProductDetails(resolvedParams?.slug);
    return {
        title: `${course?.title}| Becodemy Marketplace`,
        description: course?.short_description ||
            "Discover high quality course on Becodemy Marketplace",
        openGraph: {
            title: course?.title,
            description: course?.short_description || "",
            images: [course?.images?.[0]?.url || "./default-image.png"],
            type: "website"
        },
        twitter: {
            card: "summary_large_image",
            title: course?.title || "",
            description: course?.short_description || "",
            images: [course?.images?.[0]?.url || "./default-image.png"],
        }
    }
}

const Page = async ({params}: { params: { slug: string } }) => {
    const resolvedParams = await params;
    const productDetails = await fetchProductDetails(resolvedParams?.slug);
    console.log("productDetails", productDetails);
    return (
        <ProductDetails productDetails={productDetails}/>
    );
};

export default Page;