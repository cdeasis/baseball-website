import { Header } from '../components/Header';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react'; 
import { MiniNewsCard } from '../components/MiniNewsCard';
import { NewsCard } from '../components/NewsCard';
import { NewsCardMain } from '../components/NewsCardMain';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const News = () => {
    const [searchParams] = useSearchParams();
    const initialID = parseInt(searchParams.get("id"));
    const [activeID, setActiveID] = useState(null);
    const [expandedID, setExpandedID] = useState([]);
    const articleRefs = useRef({});
    const miniCardRefs = useRef({});
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        if (initialID && articleRefs.current[initialID]) {
            articleRefs.current[initialID].scrollIntoView({ behavior: "smooth" })
        }
    }, [initialID, articles]);
    
    const handleScroll = useCallback(() => {
        if (!articles.length) return;

        let closestID = null;
        let closestDistance = Infinity;

        for (const article of articles) {
            const el = articleRefs.current[article.id];
            if (el) {
                const rect = el.getBoundingClientRect();
                const distance = Math.abs(rect.top);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestID = article.id;
                }
            }
        }

        if (closestID !== null && closestID !== activeID) {
            setActiveID(closestID);

            const mini = miniCardRefs.current[closestID];
            if (mini) {
                const miniRect = mini.getBoundingClientRect();
                const sidebarTop = 96;
                const sidebarBottom = window.innerHeight - 100;

                if (miniRect.top < sidebarTop || miniRect.bottom > sidebarBottom) {
                    mini.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                    });
                }
            }
        }
    }, [articles, activeID])

    useEffect(() => {
        if (!articles.length) return;
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll, articles]);

    useEffect(() => {
        const fetchArticles = async () => {
            try{
                const response = await axios.get('http://localhost:5000/api/news');
                const data = response.data;
                setArticles(data);

                if (!initialID && data.length > 0) {
                    setActiveID(data[0].id);
                }
            } catch (error) {
                console.error("Error fetching articles:", error);
            }
        };

        fetchArticles();
    }, [initialID]);

    return (
        <>
            <Header />
            <div className="pt-1 max-w-7xl mx-auto px-4">
                {/* News Header Block */}
                <div className="bg-white text-center py-1 border-b mb-4">
                    <h2 className="text-2xl font-bold tracking-wide">NEWS</h2>
                    <h4 className="text-sm font-semibold text-gray-700 mt-1">
                        Check out the latest news and stories from around the league!
                    </h4>
                    <Link to="/News/Archive" className="text-blue-500 hover:underline text-sm">
                        View Archive &rarr;
                    </Link>
                </div>
                {/* Two Column Layout */}
                <div className="flex gap-6">
                    {/* Left Sidebar */}
                    <div className="w-1/4 max-h-[80vh] overflow-y-auto space-y-2 pr-2 sticky top-24">
                        {articles.map((article) => (
                            <div
                                key={article.id}
                                ref={(el) => (miniCardRefs.current[article.id] = el)}
                            >
                                <MiniNewsCard
                                    key={article.id}
                                    id={article.id}
                                    title={article.title}
                                    image={article.image}
                                    isActive={activeID === article.id}
                                    onClick={(id) => {
                                        setActiveID(id);
                                        articleRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Right Sidebar */}
                    <div className="w-3/4 space-y-6">
                        {articles.map((article) => (
                            <div
                                key={article.id}
                                ref={(el) => (articleRefs.current[article.id] = el)}
                            >
                                <NewsCard
                                    id={article.id}
                                    image={article.image}
                                    title={article.title}
                                    summary={article.summary}
                                    showButton={true}
                                    onClick={() => setExpandedID((prev) => prev.includes(article.id) ? prev : [...prev, article.id])}
                                    variant="news"
                                />
                                {expandedID.includes(article.id) && <NewsCardMain article={article} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}