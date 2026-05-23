'use client';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { countries } from '../../../utils/countries';
import CreateClass from 'apps/professor-ui/src/shared/modules/create-class';

const SignUp = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [professorData, setProfessorData] = useState<FormData | null>(null);
  const [professorId,setProfessorId]=useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const {
    register,
        handleSubmit,
    formState: { errors },
  } = useForm();
  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  console.log(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/professor-registration`)
  const signUpMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/professor-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setProfessorData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!professorData) {
        return;
      }
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-professor`, {
        ...professorData,
        otp: otp.join(''),
      });
      return response.data;
    },
    onSuccess: (data) => {
      setProfessorId(data?.professor?.id)
      setActiveStep(2)

    },
  });
  const onSubmit = (data: any) => {
    console.log('data sign up', data);
    signUpMutation.mutate(data);
  };
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const resendOtp = () => {
    if (professorData) {
      signUpMutation.mutate(professorData);
    }
  };
  const connectStripe=async()=>{
    try {
      const response = await axios.post (`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`,{professorId})
     if(response.data.url ){
      window.location.href = response.data.url
     }
    } catch (error) {
      console.error("Stripe connection error",error)
    }
  }
  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
      {/* step */}
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 -translate-y-1/2 -z-10" />

        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center">
            {/* Step circle */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold z-10 ${
                step <= activeStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              {step}
            </div>

            {/* Step label */}
            <span className="mt-2 text-sm text-gray-600 whitespace-nowrap">
              {step == 1 ? 'Create account' : step == 2 ? 'Set up shop' : 'Connect Bank'}
            </span>
          </div>
        ))}
      </div>

      {/* Steps content */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep == 1 && (
          <>
            {!showOtp ? (
              <form action="" onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-center mb-4">Create Account</h3>
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
                {errors.name && (
                  <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
                )}
                <label htmlFor="" className="block text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email...."
                  className="w-full p-2  border-gray-300 outline-0 rounded mb-1"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: 'Invalid email addresss',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
                )}

                <label htmlFor="" className="block text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="03596***"
                  className="w-full p-2 border-gray-30 outline-0 rounded-[4px] mb-1"
                  {...register('phone_number', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid phone number ',
                    },
                    minLength: {
                      value: 9,
                      message: 'Phone number must be at least 9 igits ',
                    },
                    maxLength: {
                      value: 11,
                      message: 'Phone number can not axceed 11 digits ',
                    },
                  })}
                />
                <label htmlFor="" className="block text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id=""
                  className="w-full p-2 border border-gray-300 outline-0 rounded-[4px]"
                  {...register('country', { required: 'Country is required' })}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm">{String(errors.country.message)}</p>
                )}
                <label htmlFor="" className="block text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Email...."
                    className="w-full p-2  border-gray-300 outline-0 rounded mb-1"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 character',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute inset-y-0  right-3 flex  items-center text-gray-400"
                  >
                    {passwordVisible ? <Eye /> : <EyeOff />}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={signUpMutation.isPending}
                  className="w-full text-lg cursor-pointer mt-2  bg-black text-white py-2 rounded-lg"
                >
                  {signUpMutation.isPending ? 'Signing up...' : 'Sign up'}
                </button>
                {signUpMutation.isError && signUpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {signUpMutation.error.response?.data?.message || signUpMutation.error.message}
                  </p>
                )}
                <p className="text-center text-gray-500 mb-4">
                  Already have an account
                  <Link href={'/login'} className="text-blue-500">
                    Login
                  </Link>
                </p>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-center mb-4">Enter OTP</h3>
                <div className="flex justify-center gap-6">
                  {otp?.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                      maxLength={1}
                      className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>
                <button
                  disabled={verifyOtpMutation.isPending}
                  onClick={() => verifyOtpMutation.mutate()}
                  className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                </button>
                <p className="text-center text-sm mt-4">
                  {canResend ? (
                    <button onClick={resendOtp} className="text-blue-500 cursor-pointer">
                      Resend Otp
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s`
                  )}
                </p>
                {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOtpMutation.error.response?.data?.message ||
                      verifyOtpMutation.error.message}
                  </p>
                )}
              </div>
            )}
          </>
        )}
        {
          activeStep == 2 && (
            <CreateClass professorId={professorId} setActiveStep={setActiveStep}/>
          )
        }
        {
          activeStep==3&&(
            <div className='text-center'>
              <h3 className='text-2xl font-semibold'>Withdraw method</h3>
              <br/>
              <button
              onClick={connectStripe}     
              className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
>
               Connect Stripe
              </button>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default SignUp;
