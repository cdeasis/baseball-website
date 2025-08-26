const fs = require ("fs");
const path = require("path");
const matter = require("gray-matter");

// set paths
const articlesDir = path.join(__dirname, "../blog/articles");
const outputPath = path.join(__dirname, "../public/blogData.json");

// read md files
const files = fs.readdirSync(articlesDir).filter((file) => file.endsWith(".md"));

// parse and collect all articles
const articles = files.map((file) => {
    const filePath = path.join(articlesDir, file);
    const fileContent = fs.readFileSync(filePath, "utf8");

    const { data, content } = matter(fileContent);

    return {
        id: 0,
        title: data.title || "Untitled",
        date: data.date || "1970-01-01",
        summary: data.summary || "",
        image: data.image || "",
        content: content.trim(),
        pinned: data.pinned || false,
    };
});

// sort by pinned first (descending), then by date (descending)
articles.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
});

// reassign IDs based on new sort
let unpinnedCounter = 0;
let pinnedCounter = 0;

articles.forEach(article => {
    if (article.pinned) {
        article.id = 99999 + pinnedCounter++;
    } else {
        article.id = unpinnedCounter++;
    }
})

// write to blogData.json
fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), "utf8");

console.log("blogData.json generated successfully.");