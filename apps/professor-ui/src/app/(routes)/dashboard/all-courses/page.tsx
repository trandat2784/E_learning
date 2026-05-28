"use client"
import React, {useMemo, useState} from 'react';
import axiosInstance from "../../../../utils/axiosInstance";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {BarChart, ChevronRight, Eye, Pencil, Plus, Search, Star, Trash} from "lucide-react";
import {flexRender, getCoreRowModel, getFilteredRowModel, useReactTable} from "@tanstack/react-table";
import DeleteConfirmationModal from "../../../../shared/components/modals/delete.confirmation.modal";

const fetchCourses = async () => {
    const res = await axiosInstance.get("/product/api/get-class-courses");
    return res?.data?.courses;
}
const deleteCourse = async (courseId: string) => {
    await axiosInstance.delete(`/product/api/delete-course/${courseId}`);
}
const restoreCourse = async (courseId: string) => {
    await axiosInstance.put(`/product/api/restore-course/${courseId}`);
}
const CourseList = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [analyticsData, setAnalyticsData] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>();
    const queryClient = useQueryClient();
    const {data: courses = [], isLoading} = useQuery(
        {
            queryKey: ["cart-courses"],
            queryFn: fetchCourses,
            staleTime: 1000 * 60 * 5
        }
    );
    const deleteMutation = useMutation(
        {
            mutationFn: deleteCourse,
            onSuccess: (data) => {
                queryClient.invalidateQueries({queryKey: ["cart-courses"]});
                setShowDeleteModal(false);
            }
        }
    )
    const restoreMutation = useMutation(
        {
            mutationFn: restoreCourse,
            onSuccess: (data) => {
                queryClient.invalidateQueries({queryKey: ["cart-courses"]});
                setShowDeleteModal(false);
            }
        }
    )
    const columns = useMemo(
        () => [
            {
                accessorKey: "image",
                header: "Image",
                cell: ({row}: any) => {
                    console.log(row.original);
                    return (
                        <Image
                            src={row.original.image_url}
                            alt={row.original.images_url || '/placeholder-image.png'}

                            width={200}
                            height={200}
                            className={"w-12 h-12 rounded-md object-cover"}
                        />
                    )
                },
            },
            {
                accessorKey: "name",
                header: "Course Name",
                cell: ({row}: any) => {
                    const truncatedTitle = row.original.title.length > 25
                        ? `${row.original.title.substring(0, 25)}...`
                        : row.original.title;
                    return (
                        <Link
                            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                            title={row.original.title}
                            className={"text-blue-400  hover:underline"}
                        >
                            {truncatedTitle}
                        </Link>
                    )
                }
            },
            {
                accessorKey: "price",
                header: "Price",
                cell: ({row}: any) => <span>${row.original.sale_price}</span>
            },

            {
                accessorKey: "category",
                header: "Category",
            },
            {
                accessorKey: "rating",
                header: "Rating",
                cell: ({row}: any) => (
                    <div className={"flex items-center gap-1 text-yellow-400"}>
                        <Star size={18} fill={"#fdeo47"}/>
                        <span className={"text-white"}>{row.original.ratings || 5}</span>
                    </div>
                )
            },
            {
                header: "Actions",
                cell: ({row}: any) => (
                    <div className={"flex gap-3"}>
                        <Link
                            href={`/dashboard/lessons/${row.original.id}`}
                            className={"text-blue-400 hover:text-blue-300 transition"}
                        >
                            <Eye size={18}/>
                        </Link>
                        <Link
                            href={`/product/${row.original.id}`}
                            className={"text-yellow-400 hover:text-yellow-300 transition"}
                        >
                            <Pencil size={18}/>
                        </Link>
                        <button
                            className={"text-yellow-400 hover:text-yellow-300 transition"}
                        >
                            <BarChart size={18}/>
                        </button>
                        <button
                            className={"text-red-400 hover:text-red-300 transition"}
                            onClick={() => openDeleteModal(row.original)}
                        >
                            <Trash size={18}/>
                        </button>

                    </div>
                )
            }

        ], []
    )

    const table = useReactTable(
        {
            data: courses,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            globalFilterFn: "includesString",
            state: {globalFilter},
            onGlobalFilterChange: setGlobalFilter,

        })
    const openDeleteModal = (product: any) => {
        console.log("product delete", product);
        setSelectedCourse(product)
        setShowDeleteModal(true)
    }
    return (
        <div className={"w-full min-h-screen p-8"}>
            {/*Header*/}
            <div className="flex justify-between items-center mb-1">
                <h2 className={"text-2xl text-white font-semibold"}>All Courses</h2>
                <Link href={"/dashboard/create-product"}
                      className={"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"}
                >
                    <Plus size={18}/>Add Courses
                </Link>
            </div>
            {/*    Breadcrumbs*/}
            <div className={"flex items-center mb-4"}>
                <Link
                    href={"/dashboard"}
                    className={"text-blue-400 cursor-pointer"}
                >
                    Dashboard
                </Link>
                <ChevronRight size={20} className={"text-gray-200"}/>
                <span className={"text-white"}>All courses</span>
            </div>
            {/*Search bar*/}
            <div className={"flex items-center mb-4 bg-gray-900 p-2 rounded-md flex-1"}>
                <Search size={18} className={"text-gray-400 mr-2"}/>
                <input
                    type={"text"}
                    placeholder={"Search"}
                    className={"w-full bg-transparent text-white outline-none"}
                    value={globalFilter}
                    onChange={e => setGlobalFilter(e.target.value)}
                />
            </div>
            {/*    Table*/}
            <div className={"overflow-x-auto bg-gray-900 rounded-lg  p-4"}>
                {
                    isLoading ? (
                        <p className={"text-center text-white"}>Loading courses</p>
                    ) : (
                        <table className={"w-full text-white"}>
                            <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className={"border-b border-gray-800"}>
                                    {
                                        headerGroup.headers.map((header) => (
                                            <th key={header.id} className={"p-3 text-left"}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext())
                                                }
                                            </th>
                                        ))
                                    }
                                </tr>
                            ))}
                            </thead>
                            <tbody>
                            {
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={"border-b border-gray-800 hover:bg-gray-900 transition"}>
                                        {
                                            row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className={"p-3 "}
                                                >
                                                    {
                                                        flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )
                                                    }
                                                </td>
                                            ))
                                        }
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    )
                }
                {
                    showDeleteModal && (
                        <DeleteConfirmationModal product={selectedCourse}
                                                 onClose={() => setShowDeleteModal(false)}
                                                 onConfirm={() => deleteMutation.mutate(selectedCourse?.id)}
                                                 onRestore={() => restoreMutation.mutate(selectedCourse?.id)}

                        />
                    )
                }

            </div>
        </div>
    );
};

export default CourseList;