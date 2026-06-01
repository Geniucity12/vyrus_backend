import express from "express";
import passport from "passport";

const router = express.Router();

// Start Twitter OAuth
router.get("/twitter", passport.authenticate("twitter"));

// Twitter OAuth callback
router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "/auth/failure",
    session: true,
  }),
  (req, res) => {
    // On success, redirect to frontend with user info
    res.redirect(`${process.env.CLIENT_URL}/?auth=success`);
  }
);

router.get("/failure", (req, res) => {
  res.status(401).json({ message: "Twitter authentication failed" });
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;
