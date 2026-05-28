"use client"
import React, {useState} from 'react';
import {Controller, useForm} from "react-hook-form";
import {AlertCircle, ChevronRight, Clock, Play, Upload, X} from "lucide-react";
import Input from "../../../../../../../../packages/components/input"
import RichTextEditor from "../../../../../../../../packages/components/rich-text-editor";
import {useParams, useRouter} from "next/navigation";
import toast from "react-hot-toast";
import axiosInstance from "../../../../../utils/axiosInstance";

interface VideoUpload {
    fileId: string;
    file_url: string;
    duration?: number;
}

const CreateLessonPage = () => {
    const {register, control, watch, setValue, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {
            title: "",
            description: "",
            order: 1,
            isPublished: false,
            duration: 0,
            video_url: "",      // ✅ Thêm dòng này
            fileId: ""          // ✅ Thêm dòng này
        }
    });

    const router = useRouter();

    const params = useParams();
    const courseId = params?.slug;

    const [videoUpload, setVideoUpload] = useState<VideoUpload | null>(null);
    const [videoPreview, setVideoPreview] = useState<string>("");
    const [videoUploading, setVideoUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleVideoChange = async (file: File | null) => {

        if (!file) return;

        // validate
        if (!file.type.startsWith("video/")) {
            toast.error("Please upload a video");
            return;
        }

        setVideoUploading(true);

        const toastId = toast.loading("Uploading video...");

        try {

            // convert to base64
            const base64 = await new Promise<string>((resolve, reject) => {

                const reader = new FileReader();

                reader.readAsDataURL(file);

                reader.onload = () => {
                    resolve(reader.result as string);
                };

                reader.onerror = (error) => {
                    reject(error);
                };
            });

            // upload
            const res = await axiosInstance.post(
                "http://localhost:8080/product/api/upload-course-video",
                {
                    file: base64,
                    fileName: file.name
                }
            );

            console.log(res.data);

            // save state
            const uploadedVideo: VideoUpload = {
                fileId: res.data.fileId,
                file_url: res.data.video_url,
                duration: res.data.duration || 0
            };

            setVideoUpload(uploadedVideo);

            setVideoPreview(res.data.video_url);

            setValue("video_url", res.data.video_url);

            setValue("duration", res.data.duration || 0);

            toast.success(
                "Video uploaded successfully",
                {
                    id: toastId
                }
            );

        } catch (e: any) {

            console.log(e);

            toast.error(
                e?.response?.data?.message ||
                "Upload failed",
                {
                    id: toastId
                }
            );

        } finally {

            setVideoUploading(false);
        }
    };

    const handleRemoveVideo = async () => {
        try {
            if (videoUpload?.fileId) {
                await axiosInstance.delete(`/product/api/delete-course-video`, {
                    data: {fileId: videoUpload.fileId}
                });
            }
            setVideoUpload(null);
            setVideoPreview("");
            setValue("video_url", "");
            toast.success("Video removed");
        } catch (error) {
            console.log(error);
            toast.error("Failed to remove video");
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleVideoChange(e.dataTransfer.files[0]);
        }
    }

    const onSubmit = async (data: any) => {
        console.log("chay vao day")
        if (!courseId) {
            toast.error("Course ID is required");
            return;
        }

        if (!videoUpload?.file_url) {
            toast.error("Video upload is required");
            return;
        }

        setLoading(true);
        try {
            console.log("create course", {
                ...data,
                courseId,
                video_url: videoUpload.file_url,
                fileId: videoUpload.fileId
            })
            const res = await axiosInstance.post(`/product/api/${courseId}/lessons`, {
                ...data,
                courseId,
                video_url: videoUpload.file_url,
                fileId: videoUpload.fileId
            });
            console.log(res);
            toast.success("Lesson created successfully");
            router.push(`/dashboard/lessons/${courseId}`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create course");
        } finally {
            setLoading(false);
        }
    }

    const duration = watch("duration");
    const isPublished = watch("isPublished");
    const title = watch("title");

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    return (
        <form className={"w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8"}
              onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                    Create New Lesson
                </h1>
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-cyan-400 cursor-pointer hover:text-cyan-300">Dashboard</span>
                    <ChevronRight size={18}/>
                    <span className="text-cyan-400 cursor-pointer hover:text-cyan-300">Courses</span>
                    <ChevronRight size={18}/>
                    <span className="text-gray-400">Create Lesson</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Video Upload Section - Left */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        {/* Video Preview */}
                        {videoPreview ? (
                            <div className="mb-6">
                                <div
                                    className="relative rounded-xl overflow-hidden border-2 border-cyan-500/30 bg-black/40 backdrop-blur-sm group">
                                    <video
                                        src={videoPreview}
                                        controls
                                        className="w-full h-64 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveVideo}
                                        disabled={videoUploading}
                                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                                    >
                                        <X size={16}/>
                                    </button>
                                    {duration > 0 && (
                                        <div
                                            className="absolute bottom-2 left-2 bg-black/80 px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
                                            <Clock size={14} className="text-cyan-400"/>
                                            <span className="text-white">{formatDuration(duration)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive
                                    ? "border-cyan-400 bg-cyan-400/10 bg-opacity-50"
                                    : "border-gray-600 hover:border-gray-500 bg-gray-900/50"
                                }`}
                            >
                                <label htmlFor="video-input" className="cursor-pointer block">
                                    <div className="flex justify-center mb-4">
                                        <div
                                            className="p-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 bg-opacity-20">
                                            <Upload className="text-cyan-400" size={32}/>
                                        </div>
                                    </div>
                                    <p className="text-white font-semibold mb-2">Drop your video here</p>
                                    <p className="text-gray-400 text-sm mb-4">or click to browse</p>
                                    <p className="text-gray-500 text-xs">MP4, WebM, Ogg • Max 500MB</p>
                                    <input
                                        id="video-input"
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleVideoChange(e.target.files?.[0] || null)}
                                        disabled={videoUploading}
                                        className="hidden"
                                    />
                                </label>
                                {videoUploading && (
                                    <div className="mt-4">
                                        <div
                                            className="animate-spin inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                                        <p className="text-cyan-400 text-sm mt-2">Uploading...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video Info Card */}
                        {videoUpload && (
                            <div
                                className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Play size={18} className="text-cyan-400"/>
                                    <h3 className="font-semibold text-white">Video Info</h3>
                                </div>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="text-cyan-400 font-semibold">{formatDuration(duration)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Status:</span>
                                        <span
                                            className={`font-semibold ${isPublished ? "text-green-400" : "text-yellow-400"}`}>
                                            {isPublished ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Section - Right */}
                <div className="lg:col-span-2">
                    <div className="space-y-6">
                        {/* Lesson Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Lesson Title *
                            </label>
                            <Input
                                placeholder="e.g., Introduction to React Hooks"
                                {...register("title", {
                                    required: "Lesson title is required",
                                    minLength: {
                                        value: 5,
                                        message: "Title must be at least 5 characters"
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: "Title cannot exceed 100 characters"
                                    }
                                })}
                                className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 text-white"
                            />
                            {errors.title && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={14}/>
                                    {errors.title.message as string}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Description *
                            </label>
                            <Controller
                                control={control}
                                name="description"
                                rules={{
                                    required: "Description is required",
                                    minLength: {
                                        value: 10,
                                        message: "Description must be at least 10 characters"
                                    }
                                }}
                                render={({field}) => (
                                    <RichTextEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.description && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={14}/>
                                    {errors.description.message as string}
                                </p>
                            )}
                        </div>

                        {/* Lesson Order */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Lesson Order *
                                </label>
                                <Input
                                    type="number"
                                    placeholder="1"
                                    {...register("order", {
                                        required: "Lesson order is required",
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Order must be at least 1"
                                        },
                                        max: {
                                            value: 1000,
                                            message: "Order cannot exceed 1000"
                                        }
                                    })}
                                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 text-white"
                                />
                                {errors.order && (
                                    <p className="text-red-400 text-xs mt-1">
                                        {errors.order.message as string}
                                    </p>
                                )}
                            </div>

                            {/* Publish Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Publish Status
                                </label>
                                <div className="flex items-center gap-3 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            {...register("isPublished")}
                                            className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                                        />
                                        <span
                                            className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                            Publish Now
                                        </span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {isPublished ? "✓ This course will be visible to students" : "Draft mode - students cannot see this course"}
                                </p>
                            </div>
                        </div>

                        {/* Alert Box */}
                        {!videoUpload && (
                            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex gap-3">
                                <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <h4 className="font-semibold text-yellow-200 text-sm mb-1">Video Required</h4>
                                    <p className="text-yellow-100/70 text-sm">Please upload a video to create this
                                        lesson</p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-900/50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !videoUpload}
                                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                    loading || !videoUpload
                                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div
                                            className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Creating...
                                    </>
                                ) : (
                                    "Create Lesson"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Helper Text */}
            {title && (
                <div className="fixed bottom-8 left-8 animate-fade-in">
                    <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-4 shadow-xl backdrop-blur-sm">
                        <p className="text-sm text-gray-300">
                            <span className="text-cyan-400 font-semibold">📝 Lesson Title:</span> {title}
                        </p>
                    </div>
                </div>
            )}
        </form>
    );
};

export default CreateLessonPage;