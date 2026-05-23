import Image from "next/image";
import {ArrowUpRight, MapPin, Star} from "lucide-react";
import Link from "next/link";

interface ClassCardProps {
    cls: {
        id: string;
        name: string;
        description?: string;
        avatar: string;
        coverBanner?: string;
        address?: string;
        followers?: any[]
        ratings?: number
        category?: string;

    }
}

const ClassCard: React.FC<ClassCardProps> = ({cls}) => {
    return (
        <div
            className={"w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm  overflow-hidden transition"}>
            {/*cover*/}
            <div className={"h-[120px] w-full relative"}>


                <Image src={cls?.coverBanner || "https"} alt={"Cover"} fill className={"object-cover w-full h-full"}/>
            </div>
            {/*    avatar*/}
            <div className={"relative flex justify-center -mt-8"}>
                <div className={"w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow bg-white"}>
                    <Image src={cls.avatar || "https/"} alt={cls.name} width={64} height={64}
                           className={"object-cover"}/>

                </div>
            </div>
            {/*    info*/}
            <div className={"px-4 pb-4 pt-2 text-center"}>
                <h3 className={"text-base font-semibold text-gray-800"}>{cls?.name}</h3>
                <p className={"text-xs text-gray-500 mt-0.5"}>
                    {cls?.followers?.length ?? 0} Followers
                </p>
                {/*    address*/}
                <div className={"flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap"}>
                    {
                        cls.address && (
                            <span className={"flex items-center gap-1 max-w-[120px]"}>
                                <MapPin className={"w-4 h-4 shrink-0"}/>
                                <span className={"truncate"}>{cls.address}</span>
                            </span>
                        )
                    }
                    <span className={"flex items-center gap-1 "}>
                        <Star className={"w-4 h-4 text-yellow-400 fill-yellow-400"}/>
                        {cls.ratings ?? "N/A"}
                    </span>
                </div>
                {/*    category*/}
                {cls?.category && (
                    <div className={"mt-3 flex flex-wrap justify-center gap-2 text-xs"}>
                    <span className={"bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-full font-medium"}>
                        {cls.category}
                    </span>
                    </div>)
                }
                {/*    Visit Class*/}
                <div className={"mt-4"}>
                    <Link href={`class/${cls?.id}`}
                          className={"inline-flex items-center text-sm text-blue-600 font-medium hover:underline hover:text-blue-700 transition"}
                    >
                        Visit Class
                    </Link>
                    <ArrowUpRight className={"w-4 h-4 ml-1"}/>
                </div>
            </div>
        </div>
    )
}
export default ClassCard