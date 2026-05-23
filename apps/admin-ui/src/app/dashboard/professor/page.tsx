import React, {useDeferredValue, useMemo} from 'react';
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import Link from "next/link";
import {Download, Eye, Search} from "lucide-react";
import Image from "next/image";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {saveAs} from "file-saver";
import Breadcrumbs from "../../../shared/components/breadcrumbs";

interface Professor {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    class: {
        name: string;
        avatar: string;
        address: string;
    }

}

interface ProfessorsResponse {
    data: Professor[];
    meta: {
        totalProfessors: number;
        currentPage: number;
        totalPages: number;
    }
}

const ProfessorsPage = () => {
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [page, setPage] = React.useState(1);
    const deferredGlobalFilter = useDeferredValue(globalFilter);
    const limit = 10;
    const {data, isLoading}: UseQueryResult<ProfessorsResponse, Error> = useQuery(
        {
            queryKey: ["professors-list", page],
            queryFn: async () => {
                const res = await axiosInstance.get(
                    `/admin/api/get-all-professors?page=${page}&limit=${limit}`);
                return res.data;
            },
            placeholderData: (prev) => prev,
            staleTime: 1000 * 60 * 5

        }
    )
    const allProfessors = data?.data || []
    const filteredProfessors = useMemo(() => {
        return allProfessors.filter((professor: any) =>

            deferredGlobalFilter
                ? Object.values(professor)
                    .map((v: any) => (typeof v === "string" ? v : JSON.stringify(v)))
                    .join("")
                    .toLowerCase()
                    .includes(deferredGlobalFilter.toLowerCase())
                : true
        )
    }, [allProfessors, deferredGlobalFilter])
    const totalPages = Math.ceil((data?.meta?.totalProfessors ?? 0) / limit)
    const columns = useMemo(
        () => [

            {
                accessorKey: "class.avatar",
                header: "Avatar",
                cell: ({row}: any) => {
                    console.log(row.original);
                    return (
                        <Image
                            src={row.original.class?.avatar || '/placeholder-image.png'}
                            alt={row.original.name}

                            width={200}
                            height={200}
                            className={"w-12 h-12 rounded-md object-cover"}
                        />
                    )
                },
            },
            {
                accessorKey: "name",
                header: "Name",

            },
            {
                accessorKey: "email",
                header: "Email",
            },

            {
                accessorKey: "class.name",
                header: "Class Name",
                cell: ({row}: any) => {
                    const className = row.original.class?.name
                    return className ? (
                            <a href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/class/${row.original.id}`}
                               target={"_blank"}
                               rel={"noopener noreferrer"}
                               className={"text-blue-400 hover:underline"}
                            >
                                {className}
                            </a>
                        ) :
                        (<span className={"uppercase font-semibold text-blue-400"}>
                   No Class
                </span>)
                }
            },
            {
                accessorKey: "class.address",
                header: "Address",
            },
            {
                accessorKey: "createdAt",
                header: "Joined",
                cell: ({row}: any) =>
                    <span className={"text-gray-400"}>
             {new Date(row.original.createdAt).toLocaleDateString()}
                    </span>
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
            data: filteredProfessors,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getSortedRowModel: getSortedRowModel(),
            globalFilterFn: "includesString",
            state: {globalFilter},
            onGlobalFilterChange: setGlobalFilter,

        })
    const exportCSV = () => {
        const csvData = filteredProfessors.map(
            (p: any) => `${p.class.avatar},${p.name},${p.email},${p.class.name},${p.class.address},${p.createdAt}`
        )
        const blob = new Blob(
            [`avatar,name,email,ClassName,Address,createdAt\n${csvData.join("\n")}`],
            {type: "text/csv;charset=utf-8"})
        saveAs(blob, `professors-page-${page}.csv`)
    }
    return (
        <div className={"w-full min-h-screen  p-8 bg-black text-white text-sm"}>
            <div className={"flex justify-between items-center  mb-3 "}>
                <h2 className={"text-xl font-bold tracking-wide"}>All Events</h2>
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
                                Loading events...
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

export default ProfessorsPage;