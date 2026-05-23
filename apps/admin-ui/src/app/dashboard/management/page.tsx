import React from 'react';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import Breadcrumbs from "../../../shared/components/breadcrumbs";

const columns = [
    {accessorKey: "name", header: "Name"},
    {accessorKey: "email", header: "Email"},
    {accessorKey: "role", header: "Role"},

]
const Page = () => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [selectedRole, setSelectedRole] = React.useState("user");
    const queryClient = useQueryClient();
    const {data, isLoading, isError} = useQuery({
        queryKey: ["admin"],
        queryFn: async () => {
            const res = await axiosInstance.get("/admin/api/get-all-admins");
            return res.data.admins || [];
        }
    });
    const {mutate: updateRole, isPending: updating} = useMutation({
        mutationFn: async () => {
            return await axiosInstance.put("/admin/api/add-new-admin", {
                email: search,
                role: selectedRole,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admin"]});
            setOpen(false);
            setSearch("")
            setSelectedRole("user")
        },
        onError: (error) => {
            console.error("error", error);
        }
    });
    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    const handleSubmit = (e: any) => {
        e.preventDefault();
        updateRole()
    }
    return (
        <div className={"w-full min-h-screen p-8 bg-black text-white text-sm"}>
            <div className={"flex justify-between items-center mb-3"}>
                <h2 className={"text-xl font-bold tracking-wide"}>Team Manage</h2>
                <button
                    className={"bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 "}
                    onClick={() => setOpen(true)}
                >
                    Add Admin
                </button>
            </div>
            <div className={"mb-4"}>
                <Breadcrumbs title={"Team Management"}/>
            </div>
            <div className={"!rounded shadow-xl border border-slate-700 overflow-hidden"}>
                <table className={"min-w-full text-left"}>
                    <thead className={"bg-slate-900 text-slate-300"}>
                    {
                        table.getHeaderGroups().map((headerGroup: any) => (
                            <tr key={headerGroup.id}>
                                {
                                    headerGroup.headers.map((header: any) => (
                                        <th className={"p-3 "} key={header.id}>
                                            {
                                                flexRender(header.column.columnDef.header,
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
                    {isLoading ? (
                            <tr>
                                <td className={"p-4 text-center text-slate-400"} colSpan={3}>
                                    Loading...
                                </td>
                            </tr>
                        )
                        : isError ? (
                                <tr>
                                    <td colSpan={3} className={"p-4 text-center text-red-500"}>
                                        Fail to load admin
                                    </td>
                                </tr>
                            )
                            : (
                                table.getRowModel().rows.map((row: any) => (
                                    <tr className={"border-t border-slate-700 hover:bg-slate-800 transition"}
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
                            )
                    }
                    </tbody>
                </table>
            </div>
            {
                open && (
                    <div className={"fixed inset-0 z-50 bg-black/70 flex items-center justify-center"}>
                        <div className={"bg-slate-900 p-6 rounded-xl w-full max-w-md relative"}>
                            <button
                                onClick={() => setOpen(false)}
                                className={"absolute top-3 right-4 text-slate-400 hover:text-white"}
                            >
                                &time;
                            </button>
                            <h3 className={"text-lg font-semibold mb-4 "}>
                                Add new admin
                            </h3>
                            <form action="" onSubmit={handleSubmit} className={"space-y-4"}>
                                <div>
                                    <label htmlFor="" className={"block mb-1 text-slate-300"}></label>
                                    <input type="text"
                                           value={search}
                                           placeholder={"search"}
                                           className={"w-full px-3 py-2 outline-none bg-slate-800 text-white border border-slate-600 !rounded"}
                                           onChange={(e: any) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="" className={"block mb-1 text-slate-300"}>Role</label>
                                    <select name="" id=""
                                            value={selectedRole}
                                            className={"w-full px-3 py-2 border border-slate-600  !rounded outline-none bg-slate-800 text-white"}
                                            onChange={(e: any) => setSelectedRole(e.target.value)}>

                                        <option value="user">User</option>
                                        <option value="admin">User</option>

                                    </select>
                                </div>
                                <div className={"flex gap-8 pt-2"}>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className={"w-full px-4 py-2 bg-slate-700 !rounded hover:bg-slate-600 text-sm text-white"}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type={"submit"}
                                        disabled={updating}
                                        className={"w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm text-white"}
                                    >
                                        {updating ? "Updating..." : "Add admin"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Page;