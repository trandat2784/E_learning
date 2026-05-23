"use client"
import React, {useEffect} from 'react';
import useSidebar from "../../../hooks/useSidebar";
import {usePathname} from "next/navigation";
import useProfessor from "../../../hooks/useProfessor";
import Box from "../Box";
import Link from "next/link";
import Logo from "../../../assets/svgs/logo";
import {SideBar} from "./sidebar.styles";
import SidebarItem from "./sidebar.item";
import Home from "../../../assets/icons/home";
import SidebarMenu from "./sidebar.menu";
import {
    BellPlus,
    CalendarPlus,
    Headset,
    ListOrdered,
    LogOut,
    Mail,
    PackageSearch,
    Settings,
    SquarePlus,
    TicketPercent
} from "lucide-react";
import Payment from "../../../assets/icons/payment";


const SidebarBarWrapper = () => {
    const {activeSidebar, setActiveSidebar} = useSidebar()
    const pathName = usePathname()
    const {professor} = useProfessor()
    useEffect(() => {
        setActiveSidebar(pathName)
    }, [pathName, setActiveSidebar])
    const getIconColor = (route: string) => activeSidebar == route ? "#0085ff" : "#969696"
    return (
        <Box css={{
            height: "100vh",
            zIndex: 202,
            position: "sticky",
            padding: "8px",
            top: "0",
            overflowY: "scroll",
            scrollbarWidth: "none",
        }} className={"sidebar-wrapper"}>
            <SideBar.Header>
                <Box>
                    <Link href={"/"} className={"flex text-center justify-center gap-2"}>
                        <Logo/>
                        <Box>
                            <h3 className={"text-xl font-medium text-[#ecedee]"}>
                                {professor?.class.name}
                            </h3>
                            <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px ]">
                                {professor?.class?.address}
                            </h5>
                        </Box>
                    </Link>
                </Box>
            </SideBar.Header>
            <div className={"block my-3  h-full"}>
                <SideBar.Body className={"body sidebar "}>
                    <SidebarItem title={"Dashboard"} icon={<Home fill={getIconColor("/dashboard")}/>}
                                 isActive={activeSidebar === "/dashboard"} href={"/dashboard"}/>
                    <div className={"mt-2 block"}>
                        <SidebarMenu title={"Main menu"}>
                            <SidebarItem title={"Orders"}
                                         icon={<ListOrdered size={26} color={getIconColor("/accounts")}/>}
                                         isActive={activeSidebar === "/dashboard/orders"} href={"/dashboard/orders"}/>
                            <SidebarItem title={"Payments"} icon={<Payment fill={getIconColor("/payments")}/>}
                                         isActive={activeSidebar === "/dashboard/payments"}
                                         href={"/dashboard/payments"}/>
                        </SidebarMenu>
                        <SidebarMenu title={"Products"}>
                            <SidebarItem title={"Create Product"}
                                         icon={<SquarePlus size={24}
                                                           color={getIconColor("/dashboard/create-product")}/>}
                                         isActive={activeSidebar === "/dashboard/create-product"}
                                         href={"/dashboard/create-product"}/>
                            <SidebarItem title={"All Courses"}
                                         icon={<PackageSearch size={22}
                                                              color={getIconColor("/dashboard/all-courses")}/>}
                                         isActive={activeSidebar === "/dashboard/all-courses"}
                                         href={"/dashboard/all-courses"}/>
                        </SidebarMenu>
                        <SidebarMenu title={"Events"}>
                            <SidebarItem title={"Create Event"}
                                         icon={<CalendarPlus size={24}
                                                             color={getIconColor("/dashboard/create-event")}/>}
                                         isActive={activeSidebar === "/dashboard/create-event"}
                                         href={"/dashboard/create-event"}/>
                            <SidebarItem title={"All Event"}
                                         icon={<BellPlus size={22}
                                                         color={getIconColor("/dashboard/all-events")}/>}
                                         isActive={activeSidebar === "/dashboard/all-events"}
                                         href={"/dashboard/all-events"}/>
                        </SidebarMenu>
                        <SidebarMenu title={"Controllers"}>
                            <SidebarItem title={"Inbox"}
                                         icon={<Mail size={24}
                                                     color={getIconColor("/dashboard/inbox")}/>}
                                         isActive={activeSidebar === "/dashboard/inbox"}
                                         href={"/dashboard/inbox"}/>
                            <SidebarItem title={"Settings"}
                                         icon={<Settings size={24}
                                                         color={getIconColor("/dashboard/settings")}/>}
                                         isActive={activeSidebar === "/dashboard/settings"}
                                         href={"/dashboard/settings"}/>
                            <SidebarItem title={"Notifications"}
                                         icon={<Headset size={24}
                                                        color={getIconColor("/dashboard/notifications")}/>}
                                         isActive={activeSidebar === "/dashboard/notifications"}
                                         href={"/dashboard/notifications"}/>
                        </SidebarMenu>
                        <SidebarMenu title={"Extras"}>
                            <SidebarItem title={"Discount Code"}
                                         icon={<TicketPercent size={22}
                                                              color={getIconColor("/dashboard/discount-codes")}/>}
                                         isActive={activeSidebar === "/dashboard/discount-codes"}
                                         href={"/dashboard/discount-codes"}/>
                            <SidebarItem title={"Log Out"}
                                         icon={<LogOut size={22}
                                                       color={getIconColor("/dashboard/logout")}/>}
                                         isActive={activeSidebar === "/dashboard/logout"}
                                         href={"/dashboard/logout"}/>
                        </SidebarMenu>
                    </div>

                </SideBar.Body>
            </div>
        </Box>
    );
};

export default SidebarBarWrapper;