"use client"
import React from 'react'
import Hero from "./shared/modules/hero";
import SectionTitle from "./shared/components/section/section-title";
import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import ProductCard from "./shared/components/cards/product-card";

const Page = () => {
    const {data: courses, isLoading, isError} = useQuery(
        {
            queryKey: ["courses"],
            queryFn: async () => {
                const res = await axiosInstance.get("/product/api/get-all-courses?page=1&limit=10");
                return res.data.courses
            },
            staleTime: 1000 * 60 * 2
        }
    )
    const {data: latestCourses, isLoading: latestCoursesLoading} = useQuery(
        {
            queryKey: ["latestCourse"],
            queryFn: async () => {
                const res = await axiosInstance.get("/product/api/get-all-courses?page=1&limit=10&type=latest");
                return res.data.courses
            },
            staleTime: 1000 * 60 * 2
        }
    )
    // const {data: classes, isLoading: classLoading} = useQuery(
    //     {
    //         queryKey: ["classes"],
    //         queryFn: async () => {
    //             const res = await axiosInstance.get("/product/api/top-classes");
    //             return res.data.classes
    //         },
    //         staleTime: 1000 * 60 * 2
    //     }
    // )
    return (
        <div className='bg-[#f5f5f5]'>
            <Hero/>
            <div className={"md:w-[80%]  w-[90%] my-10 m-auto"}>
                <div className={"mb-8"}>
                    <SectionTitle title={"Suggested Products"}/>
                </div>
                {isLoading &&
                    (<div className={"grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5"}>
                        {
                            Array.from({length: 10}).map((_, index) => (
                                <div key={index}
                                     className={"h-[250px] bg-gray-300  animate-pulse rounded-xl"}>

                                </div>
                            ))
                        }

                    </div>)
                }
                {
                    !isLoading && !isError && (
                        <div className={"m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5"}>
                            {courses?.map((product: any) => (
                                <ProductCard key={product.id} product={product}/>
                            ))}
                        </div>
                    )
                }
                {
                    courses?.length === 0 && (
                        <p className={"text-center"}>No course available</p>
                    )
                }
                {
                    isLoading && (
                        <div className={"grid grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5"}>
                            {
                                Array.from({length: 10}).map((_, index) => (
                                    <div className={"h-[250px] bg-gray-300  animate-pulse rounded-xl"} key={index}>

                                    </div>
                                ))
                            }
                        </div>
                    )
                }
                <div className={"my-8 block"}>
                    <SectionTitle title={"Lastest Products"}/>
                </div>
                {
                    !latestCoursesLoading && (
                        <div className={"m-auto grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-5 gap-5"}>
                            {
                                latestCourses?.map((product: any) => (
                                    <ProductCard product={product} key={product.id}/>
                                ))
                            }
                        </div>
                    )
                }
                {
                    latestCourses?.length == 0 && (
                        <p className={"text-center"}>No course available</p>
                    )
                }
                <div className={"my-8 block"}>
                    <SectionTitle title={"Top Class"}/>
                </div>
                {/*{*/}
                {/*    !classLoading && (*/}
                {/*        <div className={"m-auto grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-5 gap-5"}>*/}

                {/*            {*/}
                {/*                classes?.map((cls: any) => (*/}
                {/*                    <ClassCard cls={cls} key={cls.id}/>*/}
                {/*                ))*/}
                {/*            }*/}
                {/*        </div>*/}
                {/*    )*/}
                {/*}*/}
                {/*{*/}
                {/*    classes?.length === 0 && (*/}
                {/*        <p className={"text-center"}>No class available</p>*/}
                {/*    )*/}
                {/*}*/}

            </div>
        </div>
    )
}

export default Page