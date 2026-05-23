import React from "react";

const AccountsIcon = ({fill}: { fill: string }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="nextui-c-PJLV nextui-c-PJLV-ibxboxQ-css"
        >
            {/* Icon thể hiện hai người dùng (accounts/users) */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6C15 7.65685 13.6569 9 12 9C10.3431 9 9 7.65685 9 6ZM12 5C11.4477 5 11 5.44772 11 6C11 6.55228 11.4477 7 12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5Z"
                fill={fill}
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20V21H5V20ZM11 16C8.79086 16 7 17.7909 7 20H17C17 17.7909 15.2091 16 13 16H11Z"
                fill={fill}
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17 7C17 5.89543 17.8954 5 19 5C20.1046 5 21 5.89543 21 7C21 8.10457 20.1046 9 19 9C17.8954 9 17 8.10457 17 7ZM19 7H18C18 6.44772 18.4477 6 19 6C19.5523 6 20 6.44772 20 7C20 7.55228 19.5523 8 19 8C18.4477 8 18 7.55228 18 7H19Z"
                fill={fill}
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 16C3 14.3431 4.34315 13 6 13C7.65685 13 9 14.3431 9 16C9 17.6569 7.65685 19 6 19C4.34315 19 3 17.6569 3 16ZM6 15C5.44772 15 5 15.4477 5 16C5 16.5523 5.44772 17 6 17C6.55228 17 7 16.5523 7 16C7 15.4477 6.55228 15 6 15Z"
                fill={fill}
            />
        </svg>
    );
};

export default AccountsIcon;