import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Header } from '../Header';

export const NewsFullPage = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/news/${encodeURIComponent(id)}`);
                setArticle(res.data);
            } catch (e) {
                setErr("Article not found.");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    return (
        <>
            <Header />
            <div className="p-8 max-w-3xl mx-auto">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Link to="/News/Archive"className="text-blue-500 hover:underline text-sm">
                        &larr; Back to Archive
                    </Link>
                    
                    <Link to="/News" className="text-blue-500 hover:underline text-sm">
                        &larr; Back to News
                    </Link>
                </div>

                {loading && <p className="mt-6 text-gray-500">Loading...</p>}
                {err && <p className="mt-6 text-red-600">{err}</p>}

                {article && (
                    <article className="mt-6 bg-white rounded shadow p-6 space-y-3">
                        <h1 className="text-3xl font-bold">{article.title}</h1>
                        <div className="text-xs text-gray-500">
                            {article.source && <span>{article.source}</span>}
                            {article.author && <span> &middot; {article.author}</span>}
                            {article.publishedDate && (
                                <span> &middot; {new Date(article.publishedDate).toLocaleString()}</span>
                            )}
                        </div>
                        {article.image && (
                            <img src={article.image} alt="" className="w-full rounded" />
                        )}
                        {article.summary && <p className="text-gray-700">{article.summary}</p>}
                        {article.blurb && <p className="text-gray-700">{article.blurb}</p>}
                    </article>
                )}
            </div>
        </>
    );
}