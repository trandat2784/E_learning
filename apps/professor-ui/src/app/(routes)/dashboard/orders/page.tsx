import React, {useMemo, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../../../../utils/axiosInstance";

const fetchOrders = async () => {
    const res = await axiosInstance.get('/order/api/get-professor-orders');
    return res.data.orders;
}

const OrdersTable = () => {
    const [globelFilter, setGlobelFilter] = useState('');
    const {data: orders = [], isLoading} = useQuery({
        queryKey: ["professor-orders"],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5
    })
    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "Order ID",
                cell: (({row}: any) => (
                    <span className={"text-white text-sm truncate"}>
                        #{row.original.id.slice(-6).toUpperCase()}
                    </span>
                ))
            },
            {
                accessorKey: "class.name",
                header: "Class",
                cell: (({row}: any) => (
                    <span className={"text-white"}>
                        {row.original.class?.name ?? "Unknown Class"}
                    </span>
                ))
            }
        ]
    )
    return (
        <div>

        </div>
    );
};

export default Page;