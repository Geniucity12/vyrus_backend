import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

// Ensure passport strategy is loaded after dotenv
import "./services/passport";

// Load env variables
dotenv.config({ path: ".env" });

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// Required behind reverse proxies (Render/Heroku/etc.) so secure cookies work.
if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(cors({
  origin: clientUrl,
  credentials: true,
}));
app.use(express.json());

// Session middleware for Passport
// @ts-ignore: Suppress type errors for session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }) as any
);

// @ts-ignore: Suppress type errors for passport middleware
app.use(passport.initialize() as any);
// @ts-ignore: Suppress type errors for passport middleware
app.use(passport.session() as any);

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);


app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
