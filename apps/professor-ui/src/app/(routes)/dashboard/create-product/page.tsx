"use client"
import React, {useMemo, useState} from 'react';
import {Controller, useForm} from "react-hook-form";
import {ChevronRight, Wand, X} from "lucide-react";
import Image from "next/image"
import ImagePlaceHolder from "../../../../shared/components/image-placeholder";
import Input from "../../../../../../../packages/components/input"
import CustomSpecifications from "../../../../../../../packages/components/custom-specifications";
import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../../../../utils/axiosInstance";
import RichTextEditor from "../../../../../../../packages/components/rich-text-editor";
import {enhancements} from "../../../../utils/AI.enhancements";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";

interface UploadedImage {
    fileId: string;
    file_url: string
}

const Page = () => {
    const {register, control, watch, setValue, handleSubmit, formState: {errors}} = useForm();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [activeEffect, setActiveEffect] = useState<string | null>(null);
    const [isChanged, setIsChanged] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [picturedUploadingLoader, setPicturedUploadingLoader] = useState(false);
    const [image, setImage] = useState<UploadedImage | null>(null); // Changed from array to single image
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const {data, isLoading, isError} = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/product/api/get-categories")
                return res.data;
            } catch (error) {
                console.log(error)
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2
    })

    const {data: discountCodes = [], DiscountLoading} = useQuery({
        queryKey: ["cart-discount"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-discount-codes");
            return res?.data?.discount_codes || [];
        }
    })

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || {};
    const selectedCategory = watch("category")
    const regularPrice = watch("regular_price")

    const subcategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : []
    }, [selectedCategory, subCategoriesData]);

    console.log(categories, subCategoriesData)

    const onSubmit = async (data: any) => {
        console.log("submit ");
        console.log(data);

        // Add the single image to form data
        const formData = {
            ...data,
            image_url: image?.file_url // Include the single image
        };

        try {
            setLoading(true);
            await axiosInstance.post("/product/api/create-product", formData)
            router.push("/dashboard/all-courses")
        } catch (error: any) {
            toast.error(error?.data?.message)
        } finally {
            setLoading(false);
        }
    }

    const convertFileToBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error)
        })
    }

    const handleImageChange = async (file: File | null) => {
        if (!file) return
        setPicturedUploadingLoader(true);
        try {
            const fileName = await convertFileToBase64(file)
            const response = await axiosInstance.post(`/product/api/upload-product-image`, {fileName})
            const uploadedImage: UploadedImage = {
                fileId: response.data.fileId,
                file_url: response.data.file_url,
            }
            setImage(uploadedImage)
            setValue("image", uploadedImage)
        } catch (err) {
            console.log(err)
        } finally {
            setPicturedUploadingLoader(false);
        }
    }

    const handleRemoveImage = async () => {
        try {
            if (image && typeof image == "object") {
                await axiosInstance.delete("/product/api/delete-product-image",
                    {
                        data: {fileId: image.fileId!}
                    })
            }
            setImage(null)
            setValue("image", null)
            setSelectedImage("")
        } catch (error) {
            console.log(error)
        }
    }

    const applyTransformation = async (transformation: string) => {
        if (!selectedImage || processing) return
        setProcessing(true);
        setActiveEffect(transformation)
        try {
            const transformUrl = `${selectedImage}?tr=${transformation}`
            setSelectedImage(transformUrl);
        } catch (error) {
            console.log(error)
        } finally {
            setProcessing(false);
        }
    }

    const handleSaveDraft = () => {
        // Implement draft save logic
    }

    return (
        <form className={"w-full mx-auto p-8 shadow-md rounded-lg text-white"} onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">Create Course</h2>
            <div className="flex items-center">
                <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
                <ChevronRight size={20} className={"opacity-[.8]"}/>
                <span>Create Course</span>
            </div>

            {/*    Content layout*/}
            <div className="py-4 w-full flex gap-6">
                {/*    left side - Single Image Upload */}
                <div className="md:w-[35%]">
                    <ImagePlaceHolder
                        size={"765 x 850"}
                        onRemove={handleRemoveImage}
                        small={false}
                        index={0}
                        onImageChange={handleImageChange}
                        setSelectedImage={setSelectedImage}
                        picturedUploadingLoader={picturedUploadingLoader}
                        images={image ? [image] : [null]} // Convert to array format expected by component
                        setOpenImageModal={setOpenImageModal}
                    />
                </div>

                {/*right side  -form input*/}
                <div className={"md:w-[65%]"}>
                    <div className="w-full flex gap-6">
                        {/*    product title*/}
                        <div className="w-2/4">
                            <Input label={"Product Title"} placeholder={"Enter Product Title"}
                                   {...register("title", {required: "Title is required"})}
                            />
                            {
                                errors.title && (
                                    <p className={"text-red-500 text-xs mt-1"}>
                                        {errors.title.message as string}
                                    </p>
                                )
                            }
                            <div className="mt-2">
                                <Input type={"textarea"}
                                       rows={7}
                                       cols={10}
                                       label={"Short description "}
                                       placeholder={"Enter Product Description for quick view"}
                                       {...register("short_description", {
                                               required: "Description is required",
                                               validate: (value) => {
                                                   const wordCount = value.trim().split(/\s+/).length;
                                                   return (
                                                       wordCount <= 150 || `Description cannot exceed 150 words (Current: ${wordCount} characters`
                                                   )
                                               }
                                           }
                                       )}
                                />
                                {
                                    errors.short_description && (<p className={"text-red-500 text-xs mt-1"}>
                                        {errors.short_description.message as string}
                                    </p>)
                                }
                            </div>
                            <div className="mt-2">
                                <Input label={"Tags*"} placeholder={"Javascript,php"}
                                       {...register("tags", {required: "Separate related products tag with a coma"})}
                                />
                                {
                                    errors.tags && (<p className={"text-red-500 text-xs mt-1"}>
                                        {errors.tags.message as string}
                                    </p>)
                                }
                            </div>

                            <div className={"mt-2"}>
                                <CustomSpecifications control={control} errors={errors}/>
                            </div>
                        </div>

                        <div className={"w-2/4"}>
                            <label htmlFor="" className={"block font-semibold text-gray-300 mb-1"}>
                                Category
                            </label>
                            {
                                isLoading ? (
                                    <p className={"text-gray-400"}>
                                        Loading category...
                                    </p>
                                ) : isError ? (
                                    <p className={"text-red-500"}>
                                        Faild to load category.
                                    </p>
                                ) : (
                                    <Controller control={control}
                                                rules={{required: "Category is required"}}
                                                render={({field}) => (
                                                    <select
                                                        {...field}
                                                        className={"w-full border outline-none border-gray-700 bg-transparent"}
                                                    >
                                                        <option value={""} className={"bg-black"}>Select category
                                                        </option>
                                                        {categories?.map((category: string) => (
                                                            <option value={category} key={category}
                                                                    className={"bg-black"}>{category}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                name={"category"}/>
                                )
                            }
                            {
                                errors.category && (<p className={"text-red-500 text-xs mt-1"}>
                                    {errors.category.message as string}
                                </p>)
                            }

                            <div className={"mt-2"}>
                                <label htmlFor="" className={"block font-semibold text-gray-300 mb-1"}>
                                    Subcategory
                                </label>
                                {
                                    isLoading ? (
                                        <p className={"text-gray-400"}>
                                            Loading sub category...
                                        </p>
                                    ) : isError ? (
                                        <p className={"text-red-500"}>
                                            Faild to load sub category.
                                        </p>
                                    ) : (
                                        <Controller control={control}
                                                    rules={{required: "Sub category is required"}}
                                                    render={({field}) => (
                                                        <select
                                                            {...field}
                                                            className={"w-full border outline-none border-gray-700 bg-transparent"}
                                                        >
                                                            <option value={""} className={"bg-black"}>Select category
                                                            </option>
                                                            {subcategories?.map((subcategory: string) => (
                                                                <option value={subcategory} key={subcategory}
                                                                        className={"bg-black"}>{subcategory}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    name={"subCategory"}/>
                                    )
                                }
                                {
                                    errors.subcategory && (<p className={"text-red-500 text-xs mt-1"}>
                                        {errors.subcategory.message as string}
                                    </p>)
                                }
                            </div>

                            <div className={"mt-2"}>
                                <label htmlFor="" className={"block font-semibold text-gray-300 mb-1"}>
                                    Detailed Description *(Min 100 words)
                                </label>
                                <Controller render={({field}) => (
                                    <RichTextEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                                            control={control}
                                            name={"detailed_description"}/>
                                {
                                    errors.detailed_description && (<p className={"text-red-500 text-xs mt-1"}>
                                        {errors.detailed_description.message as string}
                                    </p>)
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label="Regular Price"
                                    placeholder="$20"
                                    {...register("regular_price", {
                                        valueAsNumber: true,
                                        min: {value: 0, message: "Price must be at least 1"},
                                        validate: (value) => !isNaN(value) || "Only numbers are allowed",
                                    })}
                                />
                                {
                                    errors.regular_price && (<p className={"text-red-500 text-xs mt-1"}>
                                        {errors.regular_price.message as string}
                                    </p>)
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label="Sale Price *"
                                    placeholder="15"
                                    {...register("sale_price", {
                                        required: "Sale Price is required",
                                        valueAsNumber: true,
                                        min: {value: 0, message: "Sale Price must be at least 1"},
                                        validate: (value) => {
                                            if (isNaN(value)) return "Only numbers are allowed";
                                            if (regularPrice && value >= regularPrice) {
                                                return "Sale Price must be less than Regular Price";
                                            }
                                            return true;
                                        }
                                    })}
                                />
                                {
                                    errors.sale_price && (<p className={"text-red-500 text-xs mt-1"}>
                                        {errors.sale_price.message as string}
                                    </p>)
                                }
                            </div>

                            <div className={"mt-3"}>
                                <label htmlFor="" className={"block font-semibold text-gray-300 mb-1"}>
                                    Select Discount Codes (Optional)
                                </label>
                                {
                                    DiscountLoading ? (
                                        <p className={"text-gray-400"}>
                                            Loading discount codes...
                                        </p>
                                    ) : (
                                        <div className={"flex flex-wrap gap-2"}>
                                            {
                                                discountCodes?.map((code: any) => (
                                                    <button key={code.id}
                                                            type={"button"}
                                                            className={`px-3 py-1 rounded-md text-sm font-semibold border 
                                                            ${watch("discountCodes")?.includes(code.id)
                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"}`
                                                            }
                                                            onClick={() => {
                                                                const currentSelection = watch("discountCodes") || [];
                                                                const updatedSelection = currentSelection?.includes(code.id)
                                                                    ? currentSelection.filter((id: string) => id != code.id)
                                                                    : [...currentSelection, code.id];
                                                                setValue("discountCodes", updatedSelection)
                                                            }}
                                                    >
                                                        {code?.public_name}({code.discountValue}
                                                        {code.discountType == "percentage" ? "%" : "$"}
                                                        )
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {
                openImageModal && (
                    <div
                        className={"fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50 "}>
                        <div className={"bg-gray-800 p-6 rounded-lg w-[450px] text-white"}>
                            <div className={"flex justify-between items-center pb-3 mb-4"}>
                                <h2 className={"text-lg font-semibold "}>
                                    Enhance Product Image
                                </h2>
                                <X size={20} className={"cursor-pointer"}
                                   onClick={() => setOpenImageModal(!openImageModal)}/>
                            </div>
                            <div className={"relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600"}>
                                <Image src={selectedImage}
                                       alt={"product-image"}
                                       layout={"fill"}
                                       objectFit={"contain"}
                                />
                            </div>
                            {
                                selectedImage && (
                                    <div className={"mt-4 space-y-2"}>
                                        <h3 className={"text-white text-sm font-semibold"}>
                                            AI Enhancement
                                        </h3>
                                        <div className={"grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto"}>
                                            {enhancements?.map(({label, effect}) => (
                                                <button className={`p-2 rounded-md flex items-center gap-2
                                                ${activeEffect == effect
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-700 hover:bg-gray-600"}`}
                                                        key={effect}
                                                        onClick={() => applyTransformation(effect)}
                                                        disabled={processing}
                                                >
                                                    <Wand size={18}/>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }

            <div className={"mt-6 flex justify-end gap-3"}>
                {
                    isChanged && (
                        <button type={"button"}
                                onClick={handleSaveDraft}
                                className={"px-4 py-2 bg-gray-700 text-white rounded-md"}
                        >
                            Save Draft
                        </button>
                    )
                }
                <button type={"submit"}
                        disabled={loading}
                        className={"px-4 py-2 bg-blue-600 text-white rounded-md"}>
                    {loading ? "Creating..." : "Create"}
                </button>
            </div>
        </form>
    );
};

export default Page;