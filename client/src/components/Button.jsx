function Button({
    children,
    variant = "primary",
    type = "button",
    onClick,
}) {
    const baseStyles =
        "rounded-lg px-4 py-2 font-medium transition-colors duration-200";

    const variants = {
        primary:
            "bg-purple-600 text-white hover:bg-purple-700",

        secondary:
            "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",

        outline:
            "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
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