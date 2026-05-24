"use client"
import React, {useDeferredValue, useMemo} from 'react';
import {useMutation, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import {Ban, Download, Eye, Search} from "lucide-react";
import Breadcrumbs from "../../../shared/components/breadcrumbs";
import Link from "next/link";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {saveAs} from "file-saver";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}
type UsersResponse = {
    data: User[],
    meta: {
        totalUsers: number
    }
}
const UserPage = () => {
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [roleFilter, setRoleFilter] = React.useState('');
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const deferredGlobalFilter = useDeferredValue(globalFilter);
    const limit = 10;
    const queryClient = useQueryClient();
    const {data, isLoading}: UseQueryResult<UsersResponse, Error> = useQuery<
        UsersResponse, Error, UsersResponse, [string, number]
    >(
        {
            queryKey: ["users-list", page],
            queryFn: async () => {
                const res = await axiosInstance.get(
                    `/admin/api/get-all-users?page=${page}&limit=${limit}`);
                return res.data;
            },
            placeholderData: (previousData) => previousData,
            staleTime: 1000 * 60 * 5

        }
    )
    const allUsers = data?.data || []
    const filteredUsers = useMemo(() => {
        return allUsers.filter((user: any) => {
            const matchesRole = roleFilter
                ? user.role.toLowerCase() == roleFilter.toLowerCase()
                : true
            const matchesGlobal = deferredGlobalFilter
                ? Object.values(user)
                    .join("")
                    .toLowerCase()
                    .includes(deferredGlobalFilter.toLowerCase())
                : true
            return matchesRole && matchesGlobal;
        })
    }, [allUsers, deferredGlobalFilter, roleFilter])
    const totalPages = Math.ceil((data?.meta?.totalUsers ?? 0) / limit)


    const banUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axiosInstance.put(`/admin/api/ban-user/${userId}`)

        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["users-list"]});
            setIsModalOpen(false);
            setSelectedUser(null);
        }
    })
    const columns = useMemo(
        () => [


            {
                accessorKey: "name",
                header: "Name",

            },
            {
                accessorKey: "email",
                header: "Email",
            },

            {
                accessorKey: "role",
                header: "Role",
                cell: ({row}: any) =>
                    <span className={"uppercase font-semibold text-blue-400"}>
                    {row.original.role}
                </span>
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
            data: filteredUsers,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getSortedRowModel: getSortedRowModel(),
            globalFilterFn: "includesString",
            state: {globalFilter},
            onGlobalFilterChange: setGlobalFilter,

        })
    const exportToCSV = () => {
        const csvData = filteredUsers.map(
            (user: any) => `${user.name},${user.email},${user.role},${user.createdAt}`
        )
        const blob = new Blob(
            [`Name,Email,Role,createdAt\n${csvData.join("\n")}`],
            {type: "text/csv;charset=utf-8"})
        saveAs(blob, `users-page-${page}.csv`)
    }
    return (
        <div className={"w-full min-h-screen p-8 bg-black text-white text-sm"}>
            {/*Header*/}
            <div className={"flex justify-between items-center mb-3"}>
                <h2 className={"text-xl font-bold tracking-wide"}>All users</h2>
                <div className={"flex items-center gap-2"}>
                    <button
                        onClick={exportToCSV}
                        className={"px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md"}>
                        <Download size={16}/>Export CSV
                    </button>
                    <select name="" id=""
                            className={"bg-gray-800 border border-gray-700 outline-none text-white"}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>

                    </select>
                </div>
            </div>
            <div className={"mb-4"}>

                <Breadcrumbs title={"All Users"}/>
            </div>
            <div className={"flex items-center mb-4 bg-gray-900 p-2 rounded-md flex-1"}>
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
                            <table className={"w-full text-white"}>
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
                                                            flexRender(cell.column.columnDef.cell,
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
                {/*Ban Confirmation Modal*/}
                {
                    isModalOpen && selectedUser && (
                        <div className={"fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center"}>
                            <div className={"bg-[#1e293b] rounded-2xl shadow-lg w-[90%] max-w-md p-6 relative  "}>
                                <div className={"flex items-center gap-3 mb-4"}>
                                    <h3 className={"text-white text-lg font-semibold"}>Ban user</h3>
                                </div>
                                <div className={"mb-6"}>
                                    <p className={"text-gray-300 leading-6"}>
                                        <span className={"text-yellow-400 font-semibold"}>Imported:</span>
                                    </p>
                                    Are u sure you want to abn
                                    <span className={"text-red-400 font-medium"}>
                                        {selectedUser.name}
                                    </span>
                                    ?This action can be reverted later
                                </div>
                            </div>
                            <div className={"flex justify-end gap-3"}>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className={"px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-white"}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => banUserMutation.mutate(selectedUser.id)}
                                    className={"px-4 py-2 bg-red-600 hover:bg-red-700 text-sm text-white"}
                                >
                                    <Ban size={16}/>
                                    Confirm Ban
                                </button>
                            </div>
                        </div>
                    )
                }

            </div>
        </div>
    );
};

export default UserPage;