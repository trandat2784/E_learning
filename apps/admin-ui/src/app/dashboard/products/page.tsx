"use client"
import React, {useDeferredValue, useMemo} from 'react';
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import Image from "next/image";
import Link from "next/link";
import {Download, Eye, Search} from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import Breadcrumbs from "../../../shared/components/breadcrumbs";

import {saveAs} from "file-saver";

const AllProductsPage = () => {
    const [globalFilter, setGlobalFilter] = React.useState('');
    const deferredFilter = useDeferredValue(globalFilter);
    const [page, setPage] = React.useState(1);
    const limit = 10;
    const {data, isLoading}: UseQueryResult<any> = useQuery({
        queryKey: ['all-products', page],
        queryFn: async () => {
            const res = await axiosInstance.get(`/admin/api/get-all-courses?page=${page}&limit=${limit}`);
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60 * 5

    })
    const allProducts = data?.data || []
    const filteredProducts = useMemo(() => {
        return allProducts.filter((product: any) =>
            Object.values(product)
                .join("")
                .toLowerCase()
                .includes(deferredFilter.toLowerCase()))
    }, [allProducts, deferredFilter])
    const totalPages = Math.ceil((data?.meta?.totalProducts ?? 0) / limit)
    const columns = useMemo(
        () => [
            {
                accessorKey: "image",
                header: "Image",
                cell: ({row}: any) => {
                    console.log(row.original);
                    return (
                        <Image
                            src={row.original.images[0]?.url || '/placeholder-image.png'}
                            alt={row.original.images[0]?.url}

                            width={200}
                            height={200}
                            className={"w-12 h-12 rounded-md object-cover"}
                        />
                    )
                },
            },


            {
                accessorKey: "title",
                header: "Title",
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
                accessorKey: "sale_price",
                header: "Price",
                cell: ({row}: any) => <span>${row.original.sale_price}</span>
            },

            {
                accessorKey: "stock",
                header: "Stock",
                cell: ({row}: any) =>
                    <span className={row.original.stock < 10 ? "text-red-400" : "text-white"}>
                    {row.original.stock} left
                </span>
            },
            {
                accessorKey: "category",
                header: "Category",
            },
            {
                accessorKey: "ratings",
                header: "Ratings",

            },
            {
                accessorKey: "Class.name",
                header: "Class Name",
                cell: ({row}: any) => row.original.Class?.name || "-"
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({row}: any) =>
                    new Date(row.original.createdAt).toLocaleDateString(),
            },
            {
                header: "Actions",
                cell: ({row}: any) => (
                    <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                          className={"text-blue-400 hover:underline"}
                    >
                        <Eye size={16}/>

                    </Link>
                )
            }


        ], []
    )

    const table = useReactTable(
        {
            data: filteredProducts,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getSortedRowModel: getSortedRowModel(),
            globalFilterFn: "includesString",
            state: {globalFilter},
            onGlobalFilterChange: setGlobalFilter,

        })
    const exportCSV = () => {
        const csvData = filteredProducts.map(
            (p: any) => `${p.title},${p.price},${p.stock},${p.category},${p.rating},${p.Class.name}`
        )
        const blob = new Blob(
            [`Title,Price,Stock,Category,Rating,Class\n${csvData.join("\n")}`],
            {type: "text/csv;charset=utf-8"})
        saveAs(blob, `courses-page-${page}.csv`)
    }
    return (
        <div className={"w-full min-h-screen  p-8 bg-black text-white text-sm"}>
            <div className={"flex justify-between items-center  mb-3 "}>
                <h2 className={"text-xl font-bold tracking-wide"}>All products</h2>
                <button
                    onClick={exportCSV}
                    className={"px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md"}>
                    <Download size={16}/>Export CSV
                </button>
            </div>
            <Breadcrumbs title={"All Products"}/>
            <div className={"my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1"}>
                <Search size={18} className={"text-gray-400 mr-2"}/>
                <input type="text"
                       placeholder={"Search..."}
                       className={"w-full bg-transparent text-white outline-none"}
                       value={globalFilter}
                       onChange={(e) => setGlobalFilter(e.target.value)}
                />

            </div>
            <div className={"overflow-x-auto bg-gray-900 rounded-lg p-4"}>
                {
                    isLoading ? (
                            <p className={"text-center text-white"}>
                                Loading products...
                            </p>
                        ) :
                        (
                            <table>
                                <thead>
                                {
                                    table.getHeaderGroups().map((headerGroup: any) => (
                                        <tr className={"border-b border-gray-800"} key={headerGroup.id}>
                                            {
                                                headerGroup.headers.map((header: any) => (
                                                    <th className={"p-3 text-left"} key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(header.column.columnDef.header,
                                                                header.getContext())
                                                        }
                                                    </th>
                                                ))
                                            }
                                        </tr>
                                    ))
                                }
                                </thead>
                                <tbody>
                                {
                                    table.getRowModel().rows.map((row: any) => (
                                        <tr className={"border-b border-gray-800 hover:bg-gray-900 transition"}
                                            key={row.id}>
                                            {
                                                row.getVisibleCells().map((cell: any) => (
                                                    <td key={cell.id} className={"p-3"}>
                                                        {
                                                            flexRender(cell.column.columnDef.header,
                                                                cell.getContext())
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
                <div className={"flex justify-between items-center mt-4"}>
                    <button
                        className={"px-4 py-2 bg-blue-600 rounded text-white hover:bg-green-700 "}
                        disabled={page == 1}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </button>
                    <span>
                        Page {page} of {totalPages || 1}
                    </span>
                    <button
                        className={"px-4 py-2 bg-blue-600 rounded text-white hover:bg-green-700 "}
                        disabled={page == totalPages}
                        onClick={() => setPage((prev) => Math.max(prev + 1))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllProductsPage;
