const Logo = () => {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <svg
                width="40"
                height="40"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-md"
            >
                <rect
                    x="0.5"
                    y="0.5"
                    width="55"
                    height="55"
                    rx="10"
                    className="fill-indigo-600"
                />
                <path
                    d="M20 18 L36 18 L44 26 L28 26 Z"
                    className="fill-indigo-300"
                />
                <path
                    d="M12 26 L28 26 L36 34 L20 34 Z"
                    className="fill-indigo-400"
                />
                <path
                    d="M20 34 L36 34 L28 42 L12 42 Z"
                    className="fill-indigo-500"
                />
            </svg>

            <div className="flex flex-col">
                <span className="text-sm font-semibold">Admin</span>
                <span className="text-xs text-gray-500">Dashboard</span>
            </div>
        </div>
    );
};

export default Logo;