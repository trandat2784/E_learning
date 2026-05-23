"use client"
import React, {useEffect} from 'react';
import axiosInstance from "../../../utils/axiosInstance";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {categories} from "../../../configs/categories";
import ClassCard from "../../shared/components/cards/class.card";
import {countries} from "../../../utils/countries";

const Page = () => {

    const [isClassLoading, setIsClassLoading] = React.useState(false);
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(1);
    const [classes, setClasses] = React.useState<any[]>([]);
    const [totalPage, setTotalPage] = React.useState(1);
    const [tempPriceRange, setTempPriceRange] = React.useState([0, 1199]);
    const router = useRouter();

    const updateURL = () => {
        const params = new URLSearchParams();
        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","))
        }

        if (selectedCountries.length > 0) {
            params.set("countries", selectedCountries.join(","))
        }
        params.set("page", page.toString())
        router.replace(`/classes?${decodeURIComponent(params.toString())}`)

    }
    const fetchFilteredClasses = async () => {
        setIsClassLoading(true)
        try {
            const query = new URLSearchParams();
            query.set("priceRange", priceRange.join(","))
            if (selectedCategories.length > 0) {
                query.set("categories", selectedCategories.join(","))
            }
            if (selectedCountries.length > 0)
                query.set("countries", selectedCountries.join(","))

            query.set("page", page.toString())
            query.set("limit", "12")
            const res = await axiosInstance.get(
                `/product/api/get-filtered-classes?${query.toString()}`
            )
            setClasses(res.data.classes)
            setTotalPage(res.data.pagination.totalPages)


        } catch (error) {
            console.log("Failed to fetch filtered product", error);

        } finally {
            setIsClassLoading(false);
        }
    }
    const toggleCategory = (label: string) => {
        setSelectedCategories((prev) => prev.includes(label)
            ? prev.filter((cat) => cat != label)
            : [...prev, label])
    }
    const toggleCountry = (label: string) => {
        setSelectedCountries((prev) =>
            prev.includes(label) ? prev.filter((cou) => cou != label) : [...prev, label])
    }

    useEffect(() => {
            updateURL();
            fetchFilteredClasses();
        },
        [page, selectedCategories])

    return (
        <div className={"w-full bg-[#f5f5f5] pb-10"}>
            <div className={"w-[90%] lg:w-[80%]  m-auto"}>
                <div className={"pb-[50px]"}>
                    <h1 className={"md:pt-[40px] font-medium text-[44px] leading-1 mb-[14px] font-jost"}>
                        All Classes

                    </h1>
                    <Link href={"/"} className={"text-[#55585b] hover:underline"}>
                        Home
                    </Link>
                    <span className={"inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"}></span>
                    <span className={"text-[#55585b]"}>All classes</span>
                </div>
                <div className={"w-full flex flex-col lg:flex-row gap-8"}>
                    {/*sside bar*/}
                    <aside className={"w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow-md"}>
                        {/*    categories*/}
                        <h3 className={"text-xl font-Poppins font-medium  border-b border-b-slate-300 pb-1"}>
                            Categories
                        </h3>
                        <ul className={"space-y-2  !mt-3"}>
                            {
                                categories?.map((category: any) => (
                                    <li
                                        key={category.label}
                                        className={"flex items-center justify-between"}
                                    >
                                        <label htmlFor=""
                                               className={"flex items-center gap-3 text-sm  text-gray-700"}
                                        >
                                            <input type="checkbox"
                                                   checked={selectedCategories.includes(category.value)}
                                                   onChange={() => toggleCategory(category.value)}
                                                   className={"accent-blue-600"}
                                            />
                                            {category.value}
                                        </label>
                                    </li>
                                ))
                            }
                        </ul>
                        <h3 className={"text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-6"}>
                            Countries
                        </h3>
                        <ul className={"space-y-2  !mt-3"}>
                            {

                                countries?.map((country: any) => (
                                        <li
                                            key={country}
                                            className={"flex items-center justify-between"}
                                        >
                                            <label htmlFor=""
                                                   className={"flex items-center gap-3 text-sm  text-gray-700"}
                                            >
                                                <input type="checkbox"
                                                       checked={selectedCountries.includes(country)}
                                                       onChange={() => toggleCountry(country)}
                                                       className={"accent-blue-600"}
                                                />

                                                {country}
                                            </label>
                                        </li>
                                    )
                                )
                            }
                        </ul>

                    </aside>
                    {/*Class grid*/}
                    <div className={"flex-1 px-2 lg:px-3"}>
                        {
                            isClassLoading ? (
                                <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 "}>
                                    {
                                        Array.from({length: 10}).map((_, index) => (
                                            <div
                                                key={index}
                                                className={"h-[250px] bg-gray-300 animate-pulse rounded-xl"}>

                                            </div>
                                        ))
                                    }
                                </div>
                            ) : classes.length > 0 ? (
                                <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 "}>
                                    {
                                        classes?.map((cls) => (
                                            <ClassCard cls={cls} key={cls.id} isEvent={true}/>
                                        ))
                                    }
                                </div>
                            ) : (
                                <p>No class found</p>
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