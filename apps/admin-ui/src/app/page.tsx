"use client"
import React from 'react';
import {useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import Input from "../../../../packages/components/input";
import {useMutation} from "@tanstack/react-query";
import axios, {AxiosError} from "axios";

type FormData = {
    email: string;
    password: string;
}

const Page = () => {
    const router = useRouter();
    const {register, handleSubmit} = useForm<FormData>();
    const [serverError, setServerError] = React.useState<string | null>();
    const loginMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`http://localhost:8080/api/login-admin`,
                data, {withCredentials: true});
            return response.data;
        },
        onSuccess: (data) => {
            setServerError(null);
            router.push("/dashboard");
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error?.response?.data as { message?: string })?.message || "Invalid credentials"
            setServerError(errorMessage)
        }
    })
    //login mutation
    const onSubmit = (data: FormData) => {
        loginMutation.mutate(data);
    }
    return (
        <div className={"w-full h-screen flex items-center justify-center"}>
            <div className={"md:w-[450px] pb-8 bg-slate-800 rounded-md shadow"}>
                <form className={"p-5"} action="" onSubmit={handleSubmit(onSubmit)}>
                    <h1 className={"text-3xl pb-3 pt-4 font-semibold text-center text-white font-[Poppins]"}>
                        Welcome admin
                    </h1>
                    <Input
                        label="Email"
                        placeholder={"Email..."}
                        value={"subnautica@gmail.com"}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                message: 'Invalid email address'
                            }
                        })}
                    />
                    <div className={"mt-3"}>

                        <Input
                            type={'password'}
                            placeholder="Password...."
                            value={"password"}
                            {...register('password', {
                                required: 'Password is required',

                            })}
                        />
                    </div>
                    <button
                        disabled={loginMutation.isPending}
                        className={"w-full mt-5 text-xl flex justify-center font-semibold font-Poppins cursor-pointer bg-blue-600 text-white py-2 rounded-lg"}
                        type="submit"
                    >
                        {loginMutation.isPending ? (
                            <div
                                className={"h-6 w-6 border-2 border-gray-100 border-t-transparent rounded-full animate-spin"}/>
                        ) : (
                            <>Login</>
                        )}
                    </button>
                    {
                        serverError && (
                            <p className={"text-red-500 text-sm mt-2 "}>
                                {serverError}
                            </p>
                        )
                    }
                </form>
            </div>
        </div>
    );
};

export default Page;