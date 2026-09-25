function Button({
    children,
    variant = "primary",
    type = "button",
    onClick,
}) {
    const baseStyles =
        "px-4 py-2 rounded-lg font-medium transition-colors duration-200";

    const variants = {
        primary: "bg-purple-600 text-white hover:bg-purple-700",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        outline:
            "border border-gray-300 text-gray-700 hover:bg-gray-50",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]}`}
        >
            {children}
        </button>
    );
}

export default Button;