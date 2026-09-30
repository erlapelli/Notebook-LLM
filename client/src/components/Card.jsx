function Card({ children, className = "" }) {
    return (
        <div
            className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 ${className}`}
        >
            {children}
        </div>
    );
}

export default Card;