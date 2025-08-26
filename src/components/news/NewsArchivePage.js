import { Header } from "../Header";
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';

export const NewsArchivePage = () => {
    const [articles, setArticles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredArticles, setFilteredArticles] = useState([]);

    // fetch archived articles from backend
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const [archiveRes, coldRes] = await Promise.all([
                    axios.get("/api/news/archive"),
                    axios.get("/api/news/cold"),
                ]);

                const archiveArticles = archiveRes.data.map(a => ({ ...a, isArchived: true}));
                const coldArticles = coldRes.data.map(a => ({ ...a, isArchived: false}));

                const combined = [...coldArticles, ...archiveArticles];
                setArticles(combined);
                setFilteredArticles(archiveArticles);
            } catch (err) {
                console.error("Error fetching archived articles: ", err);
            }
        };
        fetchArticles();
    }, []);

    // filter articles based on search query
    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        
        // all articles that match search query
        const matchingArticles = articles.filter(article => {
            const titleMatch = article.title.toLowerCase().includes(lowerQuery);
            const dateStr = article.publishedDate ? new Date(article.publishedDate).toISOString().split("T")[0] : "";
            const dateMatch = dateStr.includes(lowerQuery);
            return titleMatch || dateMatch;
        });

        // archive articles are always included
        const archiveMatches = matchingArticles.filter(article => article.isArchived);

        // cold articles are only included if searchQuery is non-empty and they match 
        const coldMatches = matchingArticles.filter(article => !article.isArchived && searchQuery.trim() !== "");

        setFilteredArticles([...archiveMatches, ...coldMatches]);
    }, [searchQuery, articles]);

    const TextOnlyCard = ({ article }) => (
        <Link to={`/news/article/${encodeURIComponent(article.id)}`} className="block hover:bg-gray-50 transition p-2">
            <div className="border-b pb-2">
                <h3 className="font-semibold text-md">{article.title}</h3>
                <p className="text-sm text-gray-600">{article.summary}</p>
                <p className="text-xs text-gray-400">{new Date(article.publishedDate).toLocaleString()}</p>
            </div>
        </Link>
    );
    
    return (
        <>
            <Header />
            <div className="p-8 space-y-4">
                <h1 className="text-center text-3xl font-bold">NEWS ARCHIVE</h1>
                
                <Link to="/News" className="block text-blue-500 mb-4 text-sm hover:underline text-center">
                    &larr; Return to News
                </Link>

                {/* Search Box */}
                <div className="max-w-3xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search by title or date (YYYY-MM-DD)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                    />
                </div>

                {/* Articles List */}
                {filteredArticles.length > 0 ? (
                    <div className="max-w-3xl mx-auto bg-white p-4 rounded shadow space-y-4">
                        {filteredArticles.map((article) => (
                            <TextOnlyCard key={article._id} article={article} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No articles found.</p>
                )}
            </div>
        </>
    )
}