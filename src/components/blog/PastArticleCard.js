import { Link } from "react-router-dom";

export const PastArticleCard = ({ article }) => {
    return (
        <Link to={`/blog/article/${article.id}`} className="block hover:bg-gray-50 transition rounded p-2">
            <div className="flex gap-4 items-start border-b pb-2">
                <img src={article.image} alt={article.title} className="w-24 h-16 object-cover rounded" />
                <div>
                    <h3 className="font-semibold text-md">{article.title}</h3>
                    {article.date && (
                    <p className="text-sm text-gray-400">{new Date(article.date).toLocaleString()}</p>
                    )}
                    <p className="text-sm text-gray-600">{article.summary}</p>
                </div>
            </div>
        </Link>
    );
}