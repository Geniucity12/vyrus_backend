import express from "express";
import prisma from "../db";
import { getTwitterClient } from "../services/twitterApi";

const router = express.Router();

// Verify if user follows a specific account
router.get("/verify/follow", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const user = req.user as any;
  const client = getTwitterClient(user.twitterToken, user.twitterTokenSecret);
  const targetScreenName = process.env.TARGET_TWITTER_USERNAME || "VyrusNfts";
  try {
    const friendship = await client.v1.friendship({ source_id: user.twitterId, target_screen_name: targetScreenName });
    const isFollowing = friendship.relationship.source.following;
    res.json({ following: isFollowing });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to verify follow", error: err.message });
  }
});

// Verify if user liked a specific tweet
router.get("/verify/like", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const user = req.user as any;
  const client = getTwitterClient(user.twitterToken, user.twitterTokenSecret);
  const tweetId = process.env.PINNED_TWEET_ID;
  if (!tweetId) return res.status(400).json({ message: "PINNED_TWEET_ID not set" });
  try {
    const likesPaginator = await client.v2.userLikedTweets(user.twitterId, { max_results: 100 });
    const liked = likesPaginator.tweets.some((t: any) => t.id === tweetId);
    res.json({ liked });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to verify like", error: err.message });
  }
});

// Verify if user quote tweeted the pinned tweet with 'BULLISH'
router.get("/verify/quote", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const user = req.user as any;
  const client = getTwitterClient(user.twitterToken, user.twitterTokenSecret);
  const tweetId = process.env.PINNED_TWEET_ID;
  if (!tweetId) return res.status(400).json({ message: "PINNED_TWEET_ID not set" });
  try {
    const tweetsPaginator = await client.v2.userTimeline(user.twitterId, { max_results: 100 });
    const quoted = tweetsPaginator.tweets.some((t: any) => t.referenced_tweets?.some((rt: any) => rt.type === "quoted" && rt.id === tweetId) && t.text.toLowerCase().includes("bullish"));
    res.json({ quoted });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to verify quote", error: err.message });
  }
});

// Verify if user tagged 3 friends in pinned tweet
router.get("/verify/tag", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const user = req.user as any;
  const client = getTwitterClient(user.twitterToken, user.twitterTokenSecret);
  const tweetId = process.env.PINNED_TWEET_ID;
  if (!tweetId) return res.status(400).json({ message: "PINNED_TWEET_ID not set" });
  try {
    const repliesPaginator = await client.v2.userTimeline(user.twitterId, { max_results: 100 });
    const tagged = repliesPaginator.tweets.some((t: any) => t.in_reply_to_status_id === tweetId && (t.entities?.user_mentions?.length || 0) >= 3);
    res.json({ tagged });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to verify tag", error: err.message });
  }
});


// Verify if user reposted (retweeted) the pinned tweet
router.get("/verify/repost", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const user = req.user as any;
  const client = getTwitterClient(user.twitterToken, user.twitterTokenSecret);
  const tweetId = process.env.PINNED_TWEET_ID;
  if (!tweetId) return res.status(400).json({ message: "PINNED_TWEET_ID not set" });
  try {
    const tweetsPaginator = await client.v2.userTimeline(user.twitterId, { max_results: 100, "tweet.fields": ["referenced_tweets"] });
    const reposted = tweetsPaginator.tweets.some((t: any) =>
      t.referenced_tweets?.some((rt: any) => rt.type === "retweeted" && rt.id === tweetId)
    );
    res.json({ reposted });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to verify repost", error: err.message });
  }
});

// Check if a wallet is on the allowlist (has completed tasks)
router.get("/check-role", async (req, res) => {
  const { wallet } = req.query;
  if (!wallet || typeof wallet !== "string") {
    return res.status(400).json({ message: "Wallet address required" });
  }
  try {
    const user = await prisma.user.findFirst({ where: { wallet } });
    res.json({ isAllowlisted: !!user, wallet });
  } catch (err) {
    res.status(500).json({ message: "Failed to check role" });
  }
});

// Get current user info
router.get("/me", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  res.json(req.user);
});

// Update wallet for authenticated user
router.post("/wallet", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ message: "Wallet address required" });
  try {
    const userId = (req.user as any).id;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { wallet },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update wallet" });
  }
});

export default router;
