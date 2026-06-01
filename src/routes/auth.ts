import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

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
    const u = req.user as any;
    const username = encodeURIComponent(u?.username || "");
    // Generate JWT so frontend can auth cross-domain without relying on cookies
    const token = jwt.sign(
      { userId: u?.id },
      process.env.SESSION_SECRET || "secret",
      { expiresIn: "30d" }
    );
    res.redirect(`${process.env.CLIENT_URL}/?auth=success&username=${username}&token=${token}`);
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
