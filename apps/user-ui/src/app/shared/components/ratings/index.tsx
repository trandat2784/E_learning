import React from 'react';

interface RatingsProps {
    rating: number; // 0 - 5 (có thể là số thập phân như 3.5, 4.7...)
}

const Ratings: React.FC<RatingsProps> = ({rating = 0}) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
        <div className="flex gap-0.5 text-lg">
            {/* Sao đầy */}
            {[...Array(fullStars)].map((_, i) => (
                <span key={`full-${i}`} className="text-yellow-400">★</span>
            ))}

            {/* Sao nửa */}
            {hasHalfStar && (
                <span className="text-yellow-400">½</span>
            )}

            {/* Sao rỗng */}
            {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                <span key={`empty-${i}`} className="text-gray-300">★</span>
            ))}
        </div>
    );
};

export default Ratings;