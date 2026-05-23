import React, {useEffect, useState} from 'react';
import useUser from "../../../hooks/useUser";
import {
    BadgeCheck,
    Bell,
    CheckCircle,
    Clock,
    Gift,
    Inbox,
    Loader2,
    Lock,
    LogOut,
    MapPin,
    Pencil,
    PhoneCall,
    Receipt,
    Settings,
    ShoppingBag,
    Truck,
    User
} from "lucide-react";
import StatCard from "../../shared/components/cards/stat.card";
import {useRouter, useSearchParams} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import Image from "next/image";
import QuickActionCard from "../../shared/components/cards/quick-action.card";

const Paga = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const {user, isLoading} = useUser();
    const queryTab = searchParams.get("active") || "Profile";
    const [activeTab, setActiveTab] = useState(queryTab);
    useEffect(() => {
        if (activeTab != queryTab) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("active", activeTab);
            router.replace(`/profile?${newParams.toString()}`);
        }
    }, [activeTab]);
    const logOutHandler = async () => {
        await axiosInstance.get("/api/logout-user").then((res) => {
            queryClient.invalidateQueries({queryKey: ["user"]})
            router.push("/login")
        });
    }
    return (
        <div className={"bg-gray-50 p-6 pb-14"}>
            <div className={"md:mx-w-7xl mx-auto"}>
                {/*Greeting*/}
                <div className={"text-center mb-10"}>
                    <h1 className={"text-3xl font-bold text-gray-800"}>Welcome back,</h1>
                    <span className={"text-blue-600"}>
                        {
                            isLoading ? (
                                <Loader2 className={"inline animate-spin w-5 h-5"}/>
                            ) : (
                                `${user.name || "user"}`
                            )
                        }
                    </span>
                </div>
                {/*    Profile overview grid*/}
                <div className={"grid grid-cols-1 md:grid-cols-3  gap-6"}>
                    <StatCard title={"Total Order"} count={10} Icon={Clock}/>
                    <StatCard title={"Processing Order"} count={4} Icon={Truck}/>
                    <StatCard title={"Completed Order"} count={5} Icon={CheckCircle}/>

                </div>
                <div className={"mt-10 flex flex-col md:flex-row gap-6"}>
                    {/*Left navigation*/}
                    <div className={"bg-white p-4 rounded-md shadow-md border border-gray-100 w-full md:w-1/5"}>
                        <nav className={"space-y-2"}>
                            <NavItem
                                label={"Profile"}
                                Icon={User}
                                active={activeTab == "Profile"}
                                onClick={() => setActiveTab("Profile")}
                            />
                            <NavItem
                                label={"My Order"}
                                Icon={ShoppingBag}
                                active={activeTab == "My Orders"}
                                onClick={() => setActiveTab("My Orders")}
                            />
                            <NavItem
                                label={"In Box"}
                                Icon={Inbox}
                                active={activeTab == "Inbox"}
                                onClick={() => router.push("/inbox")}
                            />
                            <NavItem
                                label={"Notification"}
                                Icon={Bell}
                                active={activeTab == "Notification"}
                                onClick={() => setActiveTab("Notification")}
                            />
                            <NavItem
                                label={"Shipping address"}
                                Icon={MapPin}
                                active={activeTab == "Shipping address"}
                                onClick={() => setActiveTab("Shipping Address")}
                            />
                            <NavItem
                                label={"Change Password"}
                                Icon={Lock}
                                active={activeTab == "Change Password"}
                                onClick={() => setActiveTab("Change Password")}
                            />
                            <NavItem
                                label={"Logout"}
                                Icon={LogOut}
                                danger
                                // onClick={() => logoutHandler()}
                            />


                        </nav>
                    </div>
                    {/*Main content*/}
                    <div className={"bg-white p-4 rounded-md shadow-md border border-gray-100 w-full md:w-[55%]"}>
                        <h2 className={"text-xl font-semibold text-gray-800 mb-4"}>
                            {activeTab}
                        </h2>
                        {
                            activeTab === "Profile" && !isLoading && user ? (
                                <div className={"space-y-4 text-sm text-gray-700"}>
                                    <div className={"flex items-center gap-3"}>
                                        <Image src={user?.avatar || ""} alt={"avatar"}
                                               width={60} height={60}
                                               className={"w-16 h-16 rounded-full border border-gray-200"}
                                        />
                                        <button className={"flex items-center gap-1 text-blue-500 text-xs font-medium"}>
                                            <Pencil className={"w-4 h-4 "}/>Change Photo
                                        </button>
                                    </div>
                                    <p>
                                        <span className={"font-semibold"}>Name:</span>{user?.name || ""}
                                    </p>
                                    <p>
                                        <span className={"font-semibold"}>Email:</span>{user?.email || ""}
                                    </p>
                                    <p>
                                        <span
                                            className={"font-semibold"}>Joined:</span>{new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <span className={"font-semibold"}>Earned points:</span>{user?.points || 0}
                                    </p>
                                </div>
                            ) : (
                                <></>
                            )
                        }
                        {/*    Right Quick pannel*/}
                        <div className={"w-full md:w-1/4 space-y-4"}>
                            <QuickActionCard Icon={Gift} title={"Referral Program"}
                                             description={"Invite friend and earn reward"}/>
                            <QuickActionCard Icon={BadgeCheck} title={"Your Badges"}
                                             description={"View your earned achievement"}/>
                            <QuickActionCard Icon={Settings} title={"Account Settings"}
                                             description={"Manage preferences and security"}/>
                            <QuickActionCard Icon={Receipt} title={"Billing History"}
                                             description={"Check your recent payments"}/>
                            <QuickActionCard Icon={Settings} title={"Account Settings"}
                                             description={"Manage preferences and security"}/>
                            <QuickActionCard Icon={PhoneCall} title={"Support Center"}
                                             description={"Need Help? Contact Us"}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Paga;
const NavItem = ({label, Icon, active, danger, onClick}: any) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2  px-3 py-2 rounded-md text-sm font-medium transition ${
                active ? "bg-blue-100 text-blue-600"
                    : danger
                        ? "text-red-500 hover:bg-red-50"
                        : "text-gray-700 hover:bg-gray-100"
            }`}

        >
            <Icon className={"w-4 h-4"}/>
            {label}
        </button>
    )
}