const mongoose = require("mongoose");
const { config } = require("dotenv");
const NewsArticle = require("../backend/models/NewsArticle");

config();

console.log("MONGO_URI:", process.env.MONGO_URI);
const MONGO_URI = process.env.MONGO_URI;

const rolloverArticles = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const now = new Date();
        const todayNY = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York"}));
        todayNY.setHours(0,0,0,0);
        
        // cutoffs
        const twoDaysAgo = new Date(todayNY);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const oneMonthAgo = new Date(todayNY);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // recent archive
        console.log("oneMonthAgo:", oneMonthAgo);
        console.log("twoDaysAgo:", twoDaysAgo);
        const archiveArticles = await NewsArticle.find({
            publishedDate: { $gte: oneMonthAgo, $lte: twoDaysAgo }
        });
        console.log("Articles matching recent archive:", archiveArticles.map(a => a.title));

        if (archiveArticles.length > 0) {
            console.log(`Archiving ${archiveArticles.length} articles (recent archive)`);
            const archiveCollection = mongoose.connection.collection("ArchiveArticles");
            await archiveCollection.insertMany(
                archiveArticles.map(a => ({ ...a.toObject(), _id: undefined }))
            );
            // remove from main collection
            await NewsArticle.deleteMany({ publishedDate: { $gte: oneMonthAgo, $lte: twoDaysAgo } });
        }

        // cold archive
        const coldArticles = await NewsArticle.find({ publishedDate: {$lt: oneMonthAgo }});

        if (coldArticles.length > 0 ) {
            console.log(`Moving ${coldArticles.length} articles to cold storage`);
            const coldCollection = mongoose.connection.collection("ColdArticles");
            await coldCollection.insertMany(
                coldArticles.map(a => ({ ...a.toObject(), _id: undefined}))
            );
            await NewsArticle.deleteMany({ publishedDate: { $lt: oneMonthAgo } });
        }

        console.log("Rollover complete.");
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        await mongoose.disconnect();
    }
};

rolloverArticles();