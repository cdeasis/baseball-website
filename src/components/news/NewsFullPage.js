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
                        {article.summaryModel && article.summaryModel !== 'extractive' && (
                            <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Summary
                            </span>
                        )}
                        {article.image && (
                            <img src={article.image} alt="" className="w-full rounded" />
                        )}
                        {/* Intro (short) */}
                        {(article.summaryShort || article.summary) && (
                            <p className="text-gray-700">{article.summaryShort || article.summary}</p>
                        )}
                        {/* Expanded (long) - only if it adds more than the short*/}
                        {(() => {
                            const short = article.summaryShort?.trim() || '';
                            const long = article.summaryLong?.trim() || '';
                            const addsMore = long && long !== short;
                            return addsMore ? (
                                <p className="text-gray-700 mt-2">{long}</p>
                            ) : null;
                        })()}
                        {article.url && (
                            <p className="mt-4">
                                <a className="text-blue-600 hover:underline" href={article.url} target="_blank" rel="noopener noreferrer">
                                    Read original &#8599;
                                </a>
                            </p>
                        )}
                    </article>
                )}
            </div>
        </>
    );
}