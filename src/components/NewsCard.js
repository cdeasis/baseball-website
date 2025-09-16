export const NewsCard = ({ id, image, title, summary, showButton = false, onClick, variant = "home" }) => {
    const isNewsPage = variant === "news";

    return (
        <div id={`news-card-${id}`} onClick={onClick} className="border p-6 rounded hover:shadow transition cursor-pointer">
            <h3 className={`${isNewsPage ? "text-3xl font-bold mb-4" : "text-xl font-semibold mb-1"}`}>{title}</h3>
            <img src={image} alt={title} className={`w-full object-cover rounded mb-4 ${isNewsPage ? "h-[400px]" : "h-48"}`} />
            <p className={`${isNewsPage ? "text-lg leading-relaxed" : "text-base text-gray-600"}`}>{summary}</p>

            {showButton && (
                <button className={`mt-6 ${
                    isNewsPage
                        ? "bg-slate-200 text-gray-600 py-2 px-6 rounded-full hover:bg-slate-400 block mx-auto" : "text-blue-500 hover:underline"
                }`} onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}>
                    Continue Reading
                </button>
            )}
        </div>
    );
}