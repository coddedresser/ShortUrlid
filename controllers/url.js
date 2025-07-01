const {nanoid}=require('nanoid');
const URL=require("../models/url");

async function handleGenerateNewShortURL(req, res) {
    const body = req.body;
    
    if (!body.url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const existing = await URL.findOne({
            redirectURL: body.url,
            createdBy: req.user._id
        });

        if (existing) {
            return res.render('home', { id: existing.shortId });
        }

        const shortID = nanoid(8);
        await URL.create({
            shortId: shortID,
            redirectURL: body.url,
            visitHistory: [],
            createdBy: req.user._id
        });

        return res.render('home', { id: shortID });

    } catch (err) {
        console.error("Error generating short URL:", err);
        return res.status(500).send("Server Error");
    }
}

async function handleGetAnalytics(req,res) {
    const shortId=req.params.shortId;
    const result=await URL.findOne({shortId});
    return res.json({
        totalClicks:result.visitHistory.length,
        anslytics:result.visitHistory
    });
}

module.exports={
    handleGenerateNewShortURL,
    handleGetAnalytics
};