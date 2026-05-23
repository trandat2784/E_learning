import React, {useEffect} from 'react';
import useSidebar from "../../../hooks/useSidebar";
import {usePathname} from "next/navigation";
import useAdmin from "../../../hooks/useAdmin";
import Box from "../box";
import {SideBar} from "./sidebar.styles";
import Link from "next/link";
import Logo from "../../../assets/svgs/logo";
import SidebarItem from "./sidebar.item";
import Home from "../../../assets/icons/home";
import SidebarMenu from "./sidebar.menu";
import {
    BellPlus,
    BellRing,
    FileClock,
    ListOrdered,
    LogOut,
    PackageSearch,
    PencilRuler,
    Settings,
    Store,
    Users
} from "lucide-react";
import Payment from "../../../assets/icons/payment";

const SidebarWrapper = () => {
    const {activeSidebar, setActiveSidebar} = useSidebar();
    const pathname = usePathname()
    const {admin} = useAdmin()

    useEffect(() => {
        setActiveSidebar(pathname)

    }, [pathname, setActiveSidebar]);

    const getIconColor = (route: string) =>
        activeSidebar == route ? "#0085ff" : "#969696"
    return (
        <Box css={{
            height: "100vh",
            zIndex: 202,
            position: "sticky",
            padding: "8px",
            top: 0,
            overflowY: "scroll",
            scrollbarWidth: "none"
        }}
             className={"sidebar-wrapper"}>
            <SideBar.Header>
                <Box>
                    <Link href="/" className={"flex justify-center text-center gap-2"}>
                        <Logo/>
                        <Box>
                            <h3 className={"text-xl font-medium text-[#ecedee]"}>
                                {admin?.name}
                            </h3>
                            <h5 className={"font-medium pl-2 text-[#ecedeecf] whitespace-nowrap "}>
                                {admin?.email}
                            </h5>
                        </Box>
                    </Link>
                </Box>
            </SideBar.Header>
            <div className={"block my-3 h-full"}>
                <SideBar.Body className={"body sidebar"}>
                    <SidebarItem title={"dashboard"}
                                 icon={<Home fill={getIconColor("/dashboard")}/>}
                                 isActive={activeSidebar == "/dashboard"}
                                 href="/dashboard"
                    />
                    <div className={"mt-2 block"}>
                        <SidebarMenu title={"Main menu"}>
                            <SidebarItem
                                title={"Orders"}
                                icon={<ListOrdered size={26} color={getIconColor("/dashboard/orders")}/>}
                                href={"/dashboard/orders"}
                                isActive={activeSidebar == "/dashboard/orders"}/>
                            <SidebarItem
                                title={"Payment"}
                                icon={<Payment fill={getIconColor("/dashboard/payments")}/>}
                                href={"/dashboard/payments"}
                                isActive={activeSidebar == "/dashboard/payments"}/>
                            <SidebarItem
                                title={"Products"}
                                icon={<PackageSearch color={getIconColor("/dashboard/products")}/>}
                                href={"/dashboard/products"}
                                isActive={activeSidebar == "/dashboard/products"}/>
                            <SidebarItem title={"Events"}
                                         icon={<BellPlus size={22} color={getIconColor("/dashboard/events")}/>}
                                         isActive={activeSidebar === "/dashboard/events"}
                                         href={"/dashboard/events"}/>
                            <SidebarItem
                                title={"Users"}
                                icon={<Users color={getIconColor("/dashboard/users")}/>}
                                href={"/dashboard/users"}
                                isActive={activeSidebar == "/dashboard/users"}/>
                            <SidebarItem
                                title={"Classes"}
                                icon={<Store color={getIconColor("/dashboard/classes")}/>}
                                href={"/dashboard/classes"}
                                isActive={activeSidebar == "/dashboard/classes"}/>
                        </SidebarMenu>
                        <SidebarMenu title={"Controllers"}>
                            <SidebarItem
                                title={"Loggers"}
                                icon={<FileClock color={getIconColor("/dashboard/loggers")}/>}
                                href={"/dashboard/loggers"}
                                isActive={activeSidebar == "/dashboard/loggers"}/>
                            <SidebarItem
                                title={"Management"}
                                icon={<Settings color={getIconColor("/dashboard/managements")}/>}
                                href={"/dashboard/managements"}
                                isActive={activeSidebar == "/dashboard/managements"}/>
                            <SidebarItem
                                title={"Notifications"}
                                icon={<BellRing color={getIconColor("/dashboard/notifications")}/>}
                                href={"/dashboard/notifications"}
                                isActive={activeSidebar == "/dashboard/notifications"}/>
                        </SidebarMenu>
                        <SidebarMenu title={"Customizations"}>
                            <SidebarItem
                                title={"All customizations"}
                                icon={<PencilRuler color={getIconColor("/dashboard/customization")}/>}
                                href={"/dashboard/customization"}
                                isActive={activeSidebar == "/dashboard/customization"}/>
                        </SidebarMenu>
                        <SidebarMenu title={"Extras"}>
                            <SidebarItem
                                title={"Logout"}
                                icon={<LogOut size={20} color={getIconColor("/logout")}/>}
                                href={"/"}
                                isActive={activeSidebar == "/logout"}/>
                        </SidebarMenu>
                    </div>
                </SideBar.Body>
            </div>
        </Box>
    );
};

export default SidebarWrapper;