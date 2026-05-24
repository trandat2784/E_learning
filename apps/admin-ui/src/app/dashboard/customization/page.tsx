"use client"
import React, {useEffect, useState} from 'react';
import axiosInstance from "../../../utils/axiosInstance";
import Breadcrumbs from "../../../shared/components/breadcrumbs";

const tabs = ["Categories", "Logo", "Banner"]

const Customization = () => {
    const [activeTab, setActiveTab] = React.useState("categories");
    const [categories, setCategories] = React.useState<string[]>([]);
    const [subCategories, setSubCategories] = React.useState<Record<string, string[]>>({});
    const [logo, setLogo] = useState<string | null>(null);
    const [banner, setBanner] = React.useState<string | null>(null);
    const [newCategory, setNewCategory] = React.useState("");
    const [newSubCategory, setNewSubCategory] = React.useState("");
    const [selectedCategory, setSelectedCategory] = React.useState("");
    useEffect(() => {
        const fetchCustomization = async () => {
            try {
                const res = await axiosInstance.get("/admin/api/get-all")
                const data = res.data;
                setCategories(data.categories || []);
                setSubCategories(data.subCategories || {});
                setLogo(data.logo || null);
                setBanner(data.banner || null);
            } catch (error) {
                console.error("Fail to fetch customization data", error);
            }
        }
        fetchCustomization();
    }, [])
    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            await axiosInstance.post("/admin/api/add-category", {
                category: newCategory,
            });

            setCategories((prev) => [...prev, newCategory]);
            setNewCategory("")
        } catch (error) {
            console.error("Fail to add category", error);
        }
    }
    const handleAddSubCategory = async () => {
        if (!newSubCategory.trim() || !selectedCategory) return
        try {
            await axiosInstance.post("/admin/api/add-subcategory", {
                category: selectedCategory,
                subCategory: newSubCategory,
            })
            setSubCategories((prev) => ({
                ...prev,
                [selectedCategory]: [...(prev[selectedCategory] || []), newSubCategory]
            }))
            setNewSubCategory("")
        } catch (error) {
            console.error("Error adding subcategory", error);
        }
    }
    return (
        <div className={"w-full min-h-screen p-8"}>
            <h2 className={"text-2xl text-white font-semibold mb-2"}>Customization</h2>
            <Breadcrumbs title={"Customization"}/>
            <div className={"flex items-center gap-6 mt-6 border-b border-gray-700"}>

                {
                    tabs.map((tab) => (
                        <button key={tab}>
                            {tab}
                        </button>
                    ))
                }
            </div>
            {/*Tab content*/}
            <div className={"mt-8 text-white"}>
                {
                    activeTab === "Categories" && (
                        <div className={"space-y-4"}>
                            {
                                categories.length == 0 ? (
                                    <p className={"text-gray-400"}>No categories found</p>
                                ) : (
                                    categories.map((cat, idx) => (
                                        <div key={idx}>
                                            <p className={"font-semibold mb-1"}>{cat}</p>
                                            {
                                                subCategories?.[cat]?.length > 0 ? (
                                                    <ul className={"ml-4 text-sm text-gray-400 list-disc"}>
                                                        {
                                                            subCategories[cat].map((sub, i) => (
                                                                <li key={i}>{sub}</li>
                                                            ))
                                                        }
                                                    </ul>
                                                ) : (
                                                    <div className={"ml-4 text-xs text-gray-500 italic"}>
                                                        No sub categories found
                                                    </div>
                                                )
                                            }
                                        </div>
                                    ))
                                )
                            }
                        </div>
                    )
                }
            </div>
            {/*Add new category*/}
            <div className="pt-4 space-x-2">
                <input type="text"
                       placeholder={"New Categories"}
                       value={newCategory}
                       onChange={(e) => setNewCategory(e.target.value)}
                       className={"px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"}
                />
                <button
                    onClick={handleAddCategory}
                    className={"text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"}
                >
                    Add Category
                </button>
            </div>
            {/*add subcategory*/}
            <div className={"pt-4 flex items-center gap-2 flex-wrap"}>
                <select name="" id="" className={"bg-gray-800 text-white outline-none border border-gray-600 "}>
                    <option value="">Select Category</option>
                    {
                        categories.map((cat, i) => (
                                <option key={i} value={cat}>
                                    {cat}
                                </option>
                            )
                        )
                    }
                </select>
            </div>
            {
                <div>
                    <div>
                        <input type="text"
                               placeholder={"New subcategories"}
                               value={newSubCategory}

                               onChange={(e) => setNewSubCategory(e.target.value)}
                               className={"px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"}
                        />
                        <button
                            onClick={handleAddSubCategory}
                            className={"text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"}
                        >
                            Add Subcategory
                        </button>
                    </div>
                </div>
            }
            {
                activeTab === "Logo" && (
                    <div className={"space-y-4"}>
                        {
                            logo ? (
                                <img src={logo} alt="logo"
                                     className={"w-full max-w-[600px] h-auto border border-gray-600 rounded-md"}
                                />
                            ) : (
                                <p className={"text-gray-400"}>No logo upload</p>
                            )
                        }
                        <div>
                            <input type="file"
                                   accept={"image/*"}
                                   className={"text-sm text-white"}
                                   onChange={async (e) => {
                                       const file = e.target.files?.[0]
                                       if (!file) return;
                                       const formData = new FormData()
                                       formData.append("file", file)
                                       try {
                                           const res = await axiosInstance.post("/admin/api/upload-logo", formData)
                                           setBanner(res.data.banner)
                                       } catch (error) {
                                           console.error("Logo upload failed", error)
                                       }
                                   }}
                            />
                        </div>
                    </div>
                )
            }

            {
                activeTab === "Banner" && (
                    <div className={"space-y-4"}>
                        {
                            banner ? (
                                <img src={banner} alt="banner"
                                     className={"w-full max-w-[600px] h-auto border border-gray-600 rounded-md"}
                                />
                            ) : (
                                <p className={"text-gray-400"}>No Banner upload</p>
                            )
                        }
                        <div>
                            <input type="file"
                                   accept={"image/*"}
                                   onChange={async (e) => {
                                       const file = e.target.files?.[0]
                                       if (!file) return;
                                       const formData = new FormData()
                                       formData.append("file", file)
                                       try {
                                           const res = await axiosInstance.post("/admin/api/upload-banner", formData)
                                           setBanner(res.data.banner)
                                       } catch (error) {
                                           console.error("Banner upload failed", error)
                                       }
                                   }}
                            />
                        </div>
                    </div>
                )
            }

        </div>
    );
};

export default Customization;