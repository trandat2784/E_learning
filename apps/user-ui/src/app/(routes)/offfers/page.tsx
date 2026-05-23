"use client"
import React, {useEffect} from 'react';
import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {Range} from "react-range"
import ProductCard from "../../shared/components/cards/product-card";

const MIN = 0
const MAX = 1199
const Page = () => {

    const [isProductLoading, setIsProductLoading] = React.useState(false);
    const [priceRange, setPriceRange] = React.useState([0, 1199]);
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
    const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(1);
    const [products, setProducts] = React.useState<any[]>([]);
    const [totalPage, setTotalPage] = React.useState(1);
    const [tempPriceRange, setTempPriceRange] = React.useState([0, 1199]);
    const router = useRouter();
    const colors = [
        {name: "Black", code: "#000"},
        {name: "Red", code: "#ff0000"},
        {name: "Green", code: "#00ff00"},
        {name: "Blue", code: "#0000ff"},
        {name: "Yellow", code: "#ffff00"},
        {name: "Magenta", code: "#ff00ff"},
        {name: "Cyan", code: "#00ffff"},

    ]
    const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
    const updateURL = () => {
        const params = new URLSearchParams();
        params.set("priceRange", priceRange.join(","))
        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","))
        }
        if (selectedColors.length > 0) {
            params.set("colors", selectedColors.join(","))
            if (selectedSizes.length > 0) {
                params.set("sizes", selectedSizes.join(","))
            }
            params.set("page", page.toString())
            router.replace(`/offers?${decodeURIComponent(params.toString())}`)
        }
    }
    const fetchFilteredCourses = async () => {
        setIsProductLoading(true)
        try {
            const query = new URLSearchParams();
            query.set("priceRange", priceRange.join(","))
            if (selectedCategories.length > 0) {
                query.set("categories", selectedCategories.join(","))
            }
            if (selectedColors.length > 0)
                query.set("colors", selectedColors.join(","))
            if (selectedSizes.length > 0) {
                query.set("sizes", selectedSizes.join(","))
            }
            query.set("page", page.toString())
            query.set("limit", "12")
            const res = await axiosInstance.get(
                `/product/api/get-filtered-offers?${query.toString()}`
            )
            setProducts(res.data.courses)
            setTotalPage(res.data.pagination.totalPages)


        } catch (error) {
            console.log("Failed to fetch filtered product", error);

        } finally {
            setIsProductLoading(false);
        }
    }
    const toggleCategory = (label: string) => {
        setSelectedCategories((prev) => prev.includes(label)
            ? prev.filter((cat) => cat != label)
            : [...prev, label])
    }
    const toggleColor = (color: string) => {
        setSelectedColors((prev) =>
            prev.includes(color) ? prev.filter((c) => c != color) : [...prev, color])
    }
    const toggleSize = (size: string) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s != size) : [...prev, size])
    }
    useEffect(() => {
            updateURL();
            fetchFilteredCourses();
        },
        [priceRange, selectedColors, selectedSizes, page, selectedCategories])
    const {data, isLoading} = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-categories")
            return res.data;
        },
        staleTime: 1000 * 60 * 30,
    })
    return (
        <div className={"w-full bg-[#f5f5f5] pb-10"}>
            <div className={"w-[90%] lg:w-[80%]  m-auto"}>
                <div className={"pb-[50px]"}>
                    <h1 className={"md:pt-[40px] font-medium text-[44px] leading-1 mb-[14px] font-jost"}>
                        All Product

                    </h1>
                    <Link href={"/"} className={"text-[#55585b] hover:underline"}>
                        Home
                    </Link>
                    <span className={"inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"}></span>
                    <span className={"text-[#55585b]"}>All product</span>
                </div>
                <div className={"w-full flex flex-col lg:flex-row gap-8"}>
                    {/*sside bar*/}
                    <aside className={"w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow-md"}>
                        <h3 className={"text-xl font-Poppins font-medium "}>Price Filter</h3>
                        <div className={"ml-2"}>
                            <Range step={1} min={MIN} max={MAX} values={tempPriceRange}
                                   onChange={(values) => setTempPriceRange(values)}
                                   renderTrack={({props, children}) => {
                                       const [min, max] = tempPriceRange
                                       const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100
                                       const percentageRight = ((max - MIN) / (MAX - MIN)) * 100
                                       return (
                                           <div
                                               {...props}
                                               className={"h-[6px] bg-blue-200 rounded relative"}
                                               style={{...props.style}}
                                           >
                                               <div
                                                   className={"absolute h-full bg-blue-600 rounded"}
                                                   style={{
                                                       left: `${percentageLeft}%`,
                                                       width: `${percentageRight - percentageLeft}%`,
                                                   }}>
                                                   {children}
                                               </div>
                                           </div>
                                       )
                                   }}
                                   renderThumb={({props}) => {
                                       const {key, ...rest} = props
                                       return (
                                           <div key={key}{...rest}
                                                className={"w-[16px] h-[16px] bg-blue-600 rounded-full shadow"}
                                           />
                                       )
                                   }}
                            />
                        </div>
                        <div className={"flex justify-between items-center mt-2"}>
                            <div className={"text-sm text-gray-600"}>
                                ${tempPriceRange[0]} - {tempPriceRange[1]}
                            </div>
                            <button
                                className={"text-sm px-4 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white transition !rounded"}
                                onClick={() => {
                                    setPriceRange(tempPriceRange)
                                    setPage(1)
                                }}
                            >
                                Apply
                            </button>
                        </div>
                        {/*    categories*/}
                        <h3 className={"text-xl font-Poppins font-medium  border-b border-b-slate-300 pb-1"}>
                            Categories
                        </h3>
                        <ul className={"space-y-2  !mt-3"}>
                            {
                                isLoading ? (
                                    <p>Loading...</p>
                                ) : (
                                    data?.categories?.map((category: any) => (
                                        <li
                                            key={category}
                                            className={"flex items-center justify-between"}
                                        >
                                            <label htmlFor=""
                                                   className={"flex items-center gap-3 text-sm  text-gray-700"}
                                            >
                                                <input type="checkbox"
                                                       checked={selectedCategories.includes(category)}
                                                       onChange={() => toggleCategory(category)}
                                                       className={"accent-blue-600"}
                                                />
                                                {category}
                                            </label>
                                        </li>
                                    ))
                                )
                            }
                        </ul>
                        {/*    color*/}
                        <h3 className={"text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-6"}>
                            Filter by colors
                        </h3>
                        <ul className={"space-y-2  !mt-3"}>
                            {
                                isLoading ? (
                                    <p>Loading...</p>
                                ) : (
                                    colors?.map((color: any) => (
                                        <li
                                            key={color.name}
                                            className={"flex items-center justify-between"}
                                        >
                                            <label htmlFor=""
                                                   className={"flex items-center gap-3 text-sm  text-gray-700"}
                                            >
                                                <input type="checkbox"
                                                       checked={selectedColors.includes(color.name)}
                                                       onChange={() => toggleColor(color.name)}
                                                       className={"accent-blue-600"}
                                                />
                                                <span
                                                    className={"w-[16px] h-[16px] rounded-full border border-gray-200"}
                                                    style={{backgroundColor: color.code}}
                                                >
                                                </span>
                                                {color.name}
                                            </label>
                                        </li>
                                    ))
                                )
                            }
                        </ul>
                        {/*    size*/}
                        <h3 className={"text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-6"}>
                            Filter by size
                        </h3>
                        <ul className={"space-y-2  !mt-3"}>
                            {
                                isLoading ? (
                                    <p>Loading...</p>
                                ) : (
                                    sizes?.map((size: any) => (
                                        <li
                                            key={size}
                                            className={"flex items-center justify-between"}
                                        >
                                            <label htmlFor=""
                                                   className={"flex items-center gap-3 text-sm  text-gray-700"}
                                            >
                                                <input type="checkbox"
                                                       checked={selectedSizes.includes(size)}
                                                       onChange={() => toggleColor(size)}
                                                       className={"accent-blue-600"}
                                                />
                                                <span
                                                    className={"font-medium"}
                                                >
{size}
                                                </span>
                                            </label>
                                        </li>
                                    ))
                                )
                            }
                        </ul>
                    </aside>
                    {/*product*/}
                    <div className={"flex-1 px-2 lg:px-3"}>
                        {
                            isProductLoading ? (
                                <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:"}>
                                    {
                                        Array.from({length: 10}).map((_, index) => (
                                            <div
                                                key={index}
                                                className={"h-[250px] bg-gray-300 animate-pulse rounded-xl"}>

                                            </div>
                                        ))
                                    }
                                </div>
                            ) : products?.length > 0 ? (
                                <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 "}>
                                    {
                                        products?.map((product: any) => (
                                            <ProductCard product={product} key={product.id}/>
                                        ))
                                    }
                                </div>
                            ) : (
                                <p>No product found</p>
                            )
                        }
                        {
                            totalPage > 1 && (
                                <div className={"flex justify-center mt-8 gap-2"}>
                                    {
                                        Array.from({length: totalPage}).map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={`px-3 py-1 !rounded border border-gray-200 text-sm ${page == i + 1
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white text-black"}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page