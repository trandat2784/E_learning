import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { shopCategories } from '../../utils/categories';

const CreateClass = ({
  professorId,
  setActiveStep,
}: {
  professorId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const classCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-class`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });
  const onSubmit = async (data: any) => {
    const classData = { ...data, professorId };
    console.log(classData);
    classCreateMutation.mutate(classData);
  };
  const countWords = (text: string) => text.trim().split(/\s+/).length;
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-3xl  font-semibold text-center mb-2">Set up new class</h3>
        <label htmlFor="" className="block text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          placeholder="TranDat..."
          className="w-full p-2  border-gray-300 outline-0 rounded mb-1"
          {...register('name', {
            required: 'Name is required',
          })}
        />
        {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
        <label className="block text-gray-700 mb-1">Bio* (Max 100 words)</label>
        <input
          type="text"
          placeholder="Bio class..."
          className="w-full p-2  border-gray-300 outline-0  rounded-[4px] mb-1"
          {...register('bio', {
            required: 'Class bio is required',
            validate: (value) => countWords(value) <= 100 || "Bio can't  exceed 100 words",
          })}
        />
        {errors.bio && <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>}

        <label className="block text-gray-700 mb-1">Address* (Max 100 words)</label>
        <input
          type="text"
          placeholder="Adress..."
          className="w-full p-2  border-gray-300 outline-0  rounded-[4px] mb-1"
          {...register('address', {
            required: 'Adress is required',
          })}
        />
        {errors.address && <p className="text-red-500 text-sm">{String(errors.address.message)}</p>}
        <label className="block text-gray-700 mb-1">Opening hours* (Max 100 words)</label>
        <input
          type="text"
          placeholder="e.g.,Mon-Fri 9AM-6PM"
          className="w-full p-2  border-gray-300 outline-0  rounded-[4px] mb-1"
          {...register('opening_hours', {
            required: 'Opening hours is required',
          })}
        />
        {errors.opening_hours && <p className="text-red-500 text-sm">{String(errors.opening_hours.message)}</p>}
        <label className="block text-gray-700 mb-1">Website</label>
        <input
          type="text"
          placeholder="http://example.com"
          className="w-full p-2  border-gray-300 outline-0  rounded-[4px] mb-1"
          {...register('website', {
            pattern:{
              value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
              message:"Enter a valid URL"
            }
          })}
        />
        {errors.website && <p className="text-red-500 text-sm">{String(errors.website.message)}</p>}
      
      <label className="block text-gray-700 mb-1">Category</label>
       <select
       className='w-full p-2  border border-gray-300 outline-0 rounded-[4px] mb-1 '
        {...register('category', {
            required: 'Category is required',
          })}
       >
       <option>
        Select a category
       </option>
       {
        shopCategories.map(category=>(
          <option key={category.value} value={category.value}>{category.label}</option>
        ))
       }
       </select>
     
        {errors.category && <p className="text-red-500 text-sm">{String(errors.category.message)}</p>}
      <button
      type="submit"
      className="w-full text-lg bg-blue-600 text-white py-2 rounded-lg mt-4">
         Create
      </button>
      
      </form>
    </div>
  );
};

export default CreateClass;
