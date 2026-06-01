import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import passport from "passport";
import { Strategy as TwitterStrategy } from "passport-twitter";

import prisma from "../db";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY!,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
      callbackURL: process.env.TWITTER_CALLBACK_URL!,
      includeEmail: true,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { twitterId: profile.id } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              twitterId: profile.id,
              username: profile.username || profile.displayName,
              displayName: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              twitterToken: token,
              twitterTokenSecret: tokenSecret,
            },
          });
        } else {
          // Always update tokens on login
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              twitterToken: token,
              twitterTokenSecret: tokenSecret,
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
