'use client';

import {useEffect, useState} from 'react';
import {Calendar, CheckCircle, Clock, FileText, List, Loader2, Maximize2, Play, Plus, User, Video} from 'lucide-react';
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../../../../../utils/axiosInstance";

interface Video {
    id: string;
    title: string;
    duration: number;
    order: number;
    video_url?: string;
    description?: string;
}

interface ClassInfo {
    id: string;
    name: string;
    bio: string;
    category: string;
    address: string;
    opening_hours: string;
    website: string;
    socialLinks: any[];
    ratings: number;
}

interface CourseDetail {
    id: string;
    title: string;
    category: string;
    subCategory: string;
    short_description: string;
    detailed_description: string;
    image_url: string;
    tags: string[];
    starting_date: string | null;
    ending_date: string | null;
    sale_price: number;
    regular_price: number;
    ratings: number;
    custom_specifications: any;
    isDeleted: boolean;
    discount_codes: string[];
    status: string;
    totalSales: number;
    createdAt: string;
    updatedAt: string;
    classId: string;
    Class: ClassInfo | null;
    videos: Video[];
}

const fetchCourseDetail = async (id: string): Promise<CourseDetail> => {
    console.log("id", id);

    const response = await axiosInstance.get(`/product/api/get-course/${id}`);
    console.log("response", response);
    return response.data.course;
};

const CourseDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const courseId = params?.id as string;
    console.log("courseId", courseId);
    const [selectedLesson, setSelectedLesson] = useState<Video | null>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

    const {data: course, isLoading, error} = useQuery({
        queryKey: ["course-detail", courseId],
        queryFn: () => fetchCourseDetail(courseId),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5
    });

    console.log(course);

    // Set default selected lesson when data loads
    useEffect(() => {
        if (course?.videos && course.videos.length > 0 && !selectedLesson) {
            setSelectedLesson(course.videos[0]);
        }
    }, [course, selectedLesson]);

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds === 0) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleLessonClick = (lesson: Video) => {
        setSelectedLesson(lesson);
        if (window.innerWidth < 1024) {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    const markAsCompleted = () => {
        if (selectedLesson && !completedLessons.includes(selectedLesson.id)) {
            setCompletedLessons([...completedLessons, selectedLesson.id]);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4"/>
                    <p className="text-gray-600">Đang tải khóa học...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Không tìm thấy khóa học</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-col lg:flex-row h-screen lg:overflow-hidden">

                {/* LEFT SECTION - Video Player & Info */}
                <div className="flex-1 lg:overflow-y-auto">
                    {/* Video Player */}
                    <div className="bg-black aspect-video relative group">
                        {selectedLesson?.video_url ? (
                            <video
                                src={selectedLesson.video_url}
                                controls
                                className="w-full h-full object-contain"
                                poster={course.image_url}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div
                                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
                                        <Play size={40} className="text-white ml-1"/>
                                    </div>
                                    <p className="text-white text-sm">
                                        {selectedLesson ? "Video đang được cập nhật" : "Chọn bài học để bắt đầu"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Fullscreen Button */}
                        {selectedLesson?.video_url && (
                            <button
                                onClick={() => setIsVideoFullscreen(!isVideoFullscreen)}
                                className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition text-white"
                            >
                                <Maximize2 size={18}/>
                            </button>
                        )}
                    </div>

                    {/* Video Info Section */}
                    <div className="p-6 bg-white border-b border-gray-200">
                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            {selectedLesson?.title || course.title}
                        </h1>

                        {/* Meta Info */}
                        {selectedLesson && (
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                                {selectedLesson.duration > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Clock size={16}/>
                                        <span>{formatDuration(selectedLesson.duration)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <FileText size={16}/>
                                    <span>Bài {selectedLesson.order}/{course.videos.length}</span>
                                </div>
                                {completedLessons.includes(selectedLesson.id) && (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle size={16}/>
                                        <span>Đã hoàn thành</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        {(course.detailed_description || course.short_description) && (
                            <div className="prose max-w-none">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả khóa học</h3>
                                <div
                                    className="text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: selectedLesson?.description || course.detailed_description || course.short_description
                                    }}
                                />
                            </div>
                        )}

                        {/* Course Info */}
                        {(course.Class?.name || course.createdAt || course.category) && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin khóa học</h3>
                                <div className="space-y-2 text-sm">
                                    {course.Class?.name && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User size={16}/>
                                            <span>Giảng viên: {course.Class.name}</span>
                                        </div>
                                    )}
                                    {course.category && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FileText size={16}/>
                                            <span>Danh mục: {course.category} {course.subCategory && `> ${course.subCategory}`}</span>
                                        </div>
                                    )}
                                    {course.regular_price > 0 && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span>Giá: ${course.regular_price}</span>
                                            {course.sale_price > 0 && (
                                                <span className="text-red-500">${course.sale_price}</span>
                                            )}
                                        </div>
                                    )}
                                    {course.createdAt && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={16}/>
                                            <span>Ngày tạo: {new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    )}
                                    {course.short_description && (
                                        <div className="flex items-start gap-2 text-gray-600">
                                            <FileText size={16} className="mt-0.5"/>
                                            <span>{course.short_description}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mark Complete Button */}
                        {selectedLesson && !completedLessons.includes(selectedLesson.id) && selectedLesson.video_url && (
                            <button
                                onClick={markAsCompleted}
                                className="mt-6 w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20}/>
                                Đánh dấu đã hoàn thành
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT SECTION - Lessons List */}
                <div className="lg:w-96 bg-white border-l border-gray-200 flex flex-col lg:h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <List size={20} className="text-gray-600"/>
                                <h2 className="font-semibold text-gray-900">Nội dung khóa học</h2>
                            </div>
                            <div className="text-sm text-gray-500">
                                {course.videos.length} bài học
                            </div>
                        </div>

                        {/* Progress */}
                        {completedLessons.length > 0 && (
                            <>
                                <div className="text-xs text-gray-500 mt-1">
                                    {completedLessons.length}/{course.videos.length} đã hoàn thành
                                </div>
                                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                                        style={{width: `${(completedLessons.length / course.videos.length) * 100}%`}}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Lessons List - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        {course.videos.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Video size={48} className="mx-auto mb-3 text-gray-300"/>
                                <p>Chưa có bài học nào</p>
                                <p className="text-sm mt-1">Hãy tạo bài học đầu tiên</p>
                            </div>
                        ) : (
                            course.videos.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    onClick={() => handleLessonClick(lesson)}
                                    className={`
                                        group flex items-start gap-3 p-4 cursor-pointer transition
                                        hover:bg-gray-50 border-b border-gray-100
                                        ${selectedLesson?.id === lesson.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                                    `}
                                >
                                    {/* Left side - Status & Order */}
                                    <div className="flex-shrink-0">
                                        {completedLessons.includes(lesson.id) ? (
                                            <CheckCircle size={20} className="text-green-500"/>
                                        ) : (
                                            <div
                                                className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-400 flex items-center justify-center">
                                                <span className="text-xs text-gray-400">{lesson.order}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Middle - Lesson Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={`
                                                text-sm font-medium line-clamp-2
                                                ${selectedLesson?.id === lesson.id ? 'text-blue-600' : 'text-gray-900'}
                                            `}>
                                                {lesson.title}
                                            </h3>
                                            {lesson.duration > 0 && (
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                    {formatDuration(lesson.duration)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Play icon on hover */}
                                        <div className="mt-1 opacity-0 group-hover:opacity-100 transition">
                                            <span className="text-xs text-blue-500 flex items-center gap-1">
                                                <Play size={12}/>
                                                Học ngay
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right side - Video Icon */}
                                    <div className="flex-shrink-0">
                                        <Video size={16} className={`
                                            ${selectedLesson?.id === lesson.id ? 'text-blue-500' : 'text-gray-400'}
                                        `}/>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer - Create Lesson Button */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <Link
                            href={`/dashboard/course/${courseId}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                        >
                            <Plus size={18}/>
                            Tạo bài học mới
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;