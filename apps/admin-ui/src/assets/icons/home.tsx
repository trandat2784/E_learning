import React from "react";

const Home = ({fill}: { fill: string }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="nextui-c-PJLV nextui-c-PJLV-ibxboXQ-css"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 3L2 9L4 10.5L5 10V19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19V10L20 10.5L22 9L12 3ZM11 12H13V18H11V12Z"
                fill={fill}
            />
            {/* Bạn có thể thay bằng path đơn giản hơn: */}
            {/* <path d="M12 3L2 9L4 10.5L5 10V19H19V10L20 10.5L22 9L12 3Z" fill={fill} /> */}
        </svg>
    );
};

export default Home;