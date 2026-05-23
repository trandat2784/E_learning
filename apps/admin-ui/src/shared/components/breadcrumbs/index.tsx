import React from 'react';
import Link from "next/link";
import {ChevronRight} from "lucide-react";

const Breadcrumbs = ({title}: { title: string }) => {
    return (
        <div className={"w-full text-white flex items-center"}>
            <Link href={"/dashboard"} className={"text-blue-400 cursor-pointer"}>
                Dashboard
            </Link>
            <ChevronRight size={20} className={"opacity-[.8]"}/>
            <span>{title}</span>
        </div>
    );
};

export default Breadcrumbs;