import { Header } from '../Header';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react'; 
import { fetchBlogData } from '../../util/fetchBlogData';

export const ArchivePage = () => {
    const [blogData, setBlogData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBlogData().then(setBlogData);
    }, []);

    // filter articles by search term (title or date)
    const filteredArticles = searchTerm ? blogData.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        const dateMatch = article.date?.includes(searchTerm);
        return titleMatch || dateMatch;
    }) : [];

    const showResults = searchTerm.length > 0;

    const pinnedArticles = blogData.filter(article => article.pinned);

    const olderArticles = blogData.filter(article => !article.pinned && article.id >= 6);

    const TextOnlyCard = ({ article }) => (
        <Link to={`/blog/article/${article.id}`} className="block hover:bg-gray-50 transition p-2">
            <div className="border-b pb-2">
                <h3 className="font-semibold text-md">{article.title}</h3>
                {article.date && (
                    <p className="text-xs text-gray-400">{new Date(article.date).toLocaleString()}</p>
                )}
                <p className="text-sm text-gray-600">{article.summary}</p>
            </div>
        </Link>
    );
    
    return (
        <>
            <Header />
            <div className="p-8 space-y-4">
                <h1 className="text-center text-3xl font-bold">BLOG ARCHIVE</h1>

                <Link to="/Blog" className="block text-blue-500 mb-4 text-sm hover:underline text-center">
                    &larr; Return to Blog
                </Link>

                {/* Search Box */}
                <div className="max-w-3xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search by title or by date (YYYY-MM-DD)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 rounded w-full mb-4"
                    />
                </div>

                {/* Render filtered articles */}
                {showResults && (
                    <div className="max-w-3xl mx-auto bg-white p-4 rounded shadow space-y-4">
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map(article => (
                            <TextOnlyCard key={article.id} article={article} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No articles found.</p>
                    )}
                </div>
                )}
                
                {/* Pinned articles section */}
                {!showResults && pinnedArticles.length > 0 && (
                    <div className="max-w-3xl mx-auto bg-white p-4 rounded shadow space-y-4">
                        <h2 className="text-xl text-center font-bold border-b pb-1">PINNED ARTICLES</h2>
                        {pinnedArticles.map((article) => (
                            <TextOnlyCard key={article.id} article={article} />
                        ))}
                    </div>
                )}

                {/* Older articles section */}
                {!showResults && olderArticles.length > 0 && (
                    <div className="max-w-3xl mx-auto bg-white p-4 rounded shadow space-y-4">
                        <h2 className="text-xl text-center font-bold border-b pb-1">OLDER ARTICLES</h2>
                        {olderArticles.map((article) => (
                            <TextOnlyCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}