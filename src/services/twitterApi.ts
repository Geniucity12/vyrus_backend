import { TwitterApi } from 'twitter-api-v2';

export function getTwitterClient(token: string, tokenSecret: string) {
  return new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY!,
    appSecret: process.env.TWITTER_CONSUMER_SECRET!,
    accessToken: token,
    accessSecret: tokenSecret,
  });
}

// Example: get user profile
type TwitterUser = { id: string; username: string; };
export async function getUserProfile(token: string, tokenSecret: string): Promise<TwitterUser> {
  const client = getTwitterClient(token, tokenSecret);
  const user = await client.currentUser();
  return { id: user.id_str, username: user.screen_name };
}
