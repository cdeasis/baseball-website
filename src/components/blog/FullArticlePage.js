import { useParams, Link } from "react-router-dom";
import { Header } from "../Header";
import { CommentSection } from "./CommentSection";
import { useState, useEffect } from 'react';
import { fetchBlogData } from "../../util/fetchBlogData";
import ReactMarkdown from 'react-markdown';

export const FullArticleView = () => {
    const { id } = useParams ();
    const [article, setArticle] = useState(null);

    useEffect(() => {
        fetchBlogData().then(data => {
            const found = data.find(a => a.id.toString() === id);
            setArticle(found);
        });
    }, [id]);
    
    if (!article) {
        return (
            <>
                <Header />
                <div className="p-8 text-center text-red-500">
                    Article not found.
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <h1 className="text-3xl font-bold text-center">{article.title}</h1>
                <Link to="/Blog" className="block text-blue-500 mb-4 text-sm hover:underline text-center">
                Return
                </Link>
                <p className="text-center text-gray-500 text-sm">{article.date}</p>

                <img src={article.image} alt={article.title} className="w-full max-h-[500px] object-cover rounded" />

                <p className="text-xs text-gray-500 italic text-center"> {article.summary}</p>

                {/* add: [&>p]:indent-8 for indent if mind changes, can change number */}
                <div className="prose max-w-none pt-4 pb-8">
                    {article.content ? (
                        <ReactMarkdown>{article.content}</ReactMarkdown>
                    ): (
                        <p>Article content coming soon...</p>
                    )}
                </div>

                <hr className="my-6 border-gray-300" />

                <CommentSection />
            </div>
        </>
    )
}