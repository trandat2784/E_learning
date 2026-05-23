import React from 'react';
import {MoveRight} from "lucide-react";
import {useRouter} from "next/navigation";

const Hero = () => {
    const router = useRouter();
    return (
        <div className='bg-[#115061]  h-[85vh] flex flex-col w-full justify-center'>
            <div className={"md:w-[80%] w-[90%] m-auto  md-flex  h-full items-center"}>
                <div className={"md:w-1/2"}>
                    <p className={"font-Roboto font-normal text-white pb-2 text-xl"}>
                        String from 40$
                    </p>
                    <h1 className={"text-white text-6xl font-extrabold font-Roboto "}>
                        The best watch
                        <br/>
                        Collection 2025
                    </h1>
                    <p className={"font-Oregon text-white pt-4 text-3xl"}>
                        Exclusive offer
                        <span className={"text-yellow-400"}>
                            10%
                        </span>
                        off this week
                    </p>
                    <br/>
                    <button className={"w-[140px] gap-2 font-semibold h-[40px] hover"}
                            onClick={() => router.push("/products")}>
                        Shop now <MoveRight/>
                    </button>
                </div>
                <div>
                    {/*<Image*/}
                    {/*    src={"https://static-cse.canva.com/blob/1134713/JewelryandAccessoriesOnlineStoreWebsite1.jpg"}*/}
                    {/*    alt={""} width={450} height={450}/>*/}
                </div>
            </div>
        </div>
    );
};

export default Hero;