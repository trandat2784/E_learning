import React from 'react';
import {Controller, useFieldArray} from "react-hook-form";
import Input from "../input/index"
import {PlusCircle, Trash} from "lucide-react";

const CustomSpecifications = ({control, errors}: any) => {

    const {fields, append, remove} = useFieldArray({
        control,
        name: "custom-specifications",
    })
    return (
        <div>
            <label htmlFor="" className={"block font-semibold text-gray-300 mb-1"}>
                Custom specifications
            </label>
            <div className={"flex flex-col gap-3"}>
                {
                    fields?.map((item, index) => (
                        <div key={index} className={"flex gap-2 items-center"}>
                            <Controller
                                render={({field}) => (
                                    <Input label={"Specification Name"} placeholder={"eg.,Battery Life, Weight"}
                                           {...field}
                                    />
                                )}
                                name={`custom-specifications.${index}.name`} control={control}
                                rules={{required: "specification name is required"}}/>

                            <Controller
                                render={({field}) => (
                                    <Input label={"Specification Name"} placeholder={"eg.,Battery Life, Weight"}
                                           {...field}
                                    />
                                )}
                                name={`custom-specifications.${index}.name`} control={control}
                                rules={{required: "Value is required"}}/>

                            <button type={"button"}
                                    onClick={() => remove(index)}
                                    className={"text-red-500 hover:text-red-700"}>
                                <Trash size={20}/>
                            </button>
                        </div>

                    ))
                }
                <button type={"button"}
                        className={"flex items-center gap-2 text-blue-500 hover:text-blue-600"}
                        onClick={() => append({name: "", value: ""})}
                >
                    <PlusCircle size={20}/> Add specification
                </button>
            </div>
            {
                errors.custom_specifications && (<p className={"text-red-500 text-xs mt-1"}>
                    {errors.custom_specifications.message as string}
                </p>)
            }
        </div>
    );
};

export default CustomSpecifications;