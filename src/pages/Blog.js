import { Header } from '../components/Header';
import { FeaturedArticleCard } from '../components/blog/FeaturedArticleCard';
import { PastArticleCard } from '../components/blog/PastArticleCard';
import { FeedbackBox } from '../components/blog/FeedbackBox';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchBlogData } from '../util/fetchBlogData';

export const Blog = () => {
    const [blogData, setBlogData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogData().then(data => {
            setBlogData(data);
            setLoading(false);
        }).catch(err => {
            console.error("Blog fetch failed:", err)
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <>
                <Header />
                <div className="p-8 text-center">Loading...</div>
            </>
        );
    }

    if (!blogData || blogData.length === 0) {
        return (
            <>
                <Header />
                <div className="p-8 text-center text-red-500">No Articles Found.</div>
            </>
        )
    }
    
    const unpinnedArticles = blogData.filter(article => !article.pinned);

    const featuredArticle = unpinnedArticles[0];
    const pastArticles = unpinnedArticles.slice(1,6);

    return (
        <>
            <Header />
            <div className="p-8 space-y-6">
                {/* Featured Article */}
                {FeaturedArticleCard && (<FeaturedArticleCard article={featuredArticle} />)}

                {/* Bottom Section */}
                <div className="flex gap-6">
                    {/* Past Articles Box */}
                    <div className="flex-1 max-h-[400px] overflow-y-auto bg-white p-4 rounded shadow space-y-4">
                        {pastArticles.map((article) => (
                            <PastArticleCard key={article.id} article={article} />
                        ))}
                        <Link to="/Blog/Archive" className="text-blue-500 text-sm mt-4 hover:underline">
                            View Archive &rarr;
                        </Link>
                    </div>

                    {/* Feedback Box */}
                    <FeedbackBox />
                </div>
            </div>
        </>
    );
}