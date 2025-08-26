export const fetchBlogData = async() => {
    try{
        const res = await fetch("/blogData.json");
        if (!res.ok) {
            throw new Error("Failed to fetch blog data");
        }
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Fetch Error:", err);
        return [];
    }
};