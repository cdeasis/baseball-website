export const NewsCardMain = ({ article }) => {
    return (
        <div className="border mt-2 p-3 rounded bg-gray-50">
            <p className="text-lg text-gray-700">{article.blurb}</p>
        </div>
    );
}