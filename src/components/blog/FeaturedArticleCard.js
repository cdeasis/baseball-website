import { Link } from "react-router-dom";

export const FeaturedArticleCard = ({ article }) => {
    return (
        <Link to={`/blog/article/${article.id}`} className="block hover:bg-gray-50 transition rounded p-2">
            <div className="bg-white p-6 rounded shadow space-y-6 mx-32">
                <h2 className="text-2xl font-bold">{article.title}</h2>
                {article.date && (
                    <p className="text-sm text-gray-400">{new Date(article.date).toLocaleString()}</p>
                )}
                <img src={article.image} alt={article.title} className="w-34 h-64 object-cover rounded" />
                <p className="text-gray-700">{article.summary}</p>
                <div className="text-right">
                    <button className="text-blue-600 text-sm hover:underline">
                        Read More &rarr;
                    </button>
                </div>
            </div>
        </Link>
    );
}