// Require the necessary discord.js classes
require("dotenv/config");
const { Client, Intents } = require("discord.js");
const axios = require("axios");
const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
});

// Replace these with your values
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.JOSH_YT_CHANNEL_ID;
let latestVideoId = null; // To keep track of the latest video

client.on("ready", () => {
  console.log(`Successfully logged in as ${client.user.tag}!`);
  // Start interval to check for new videos every 30 minutes (1800000 milliseconds)
  setInterval(checkForNewVideo, 1800000);
});

// const IGNORE_PREFIX = "!"; // Ignore messages that start with this prefix
const CHANNELS = ["Jo Shoua"]; // Only listen to these channels

const flamboyantGreetings = [
  "oh marvelous one",
  "darling starlight",
  "glorious friend",
  "magnificent creature",
  "exquisite comrade",
  "dazzling soul",
  "resplendent buddy",
  "splendid fellow",
  "radiant spirit",
  "illustrious mate",
];

// Function to randomly pick a flamboyant greeting
function createFlamboyantHello() {
  const randomIndex = Math.floor(Math.random() * flamboyantGreetings.length);
  return (
    "Hello, " +
    flamboyantGreetings[randomIndex] +
    "✨. It's ya bot, Jo Shoua bot!"
  );
}

client.on("messageCreate", async (message) => {
  console.log("message received: ", message.content);
  if (message.author.bot) return; // Ignore messages from bots
  // if (message.content.startsWith(IGNORE_PREFIX)) return;
  if (message.content.toLowerCase() == "!checknow") {
    console.log("Checking for new video now...");
    // Check for new video
    const newVideo = await checkForNewVideo();
    // if nothing new sent:
    if (!newVideo) {
      console.log("No new video. Current latest: ", latestVideoId);
      client.channels.cache.get(DISCORD_CHANNEL_ID).send("No new video yet");
    }
  } else {
    const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
    message.channel.send(`${createFlamboyantHello()}`);
  }
});

async function checkForNewVideo() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&maxResults=1&order=date&type=video&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(url);
    const latestVideo = response.data.items[0];

    if (latestVideo && latestVideo.id.videoId !== latestVideoId) {
      // if latestVideoId is different
      console.log("former latest video: ", latestVideoId);
      console.log("new latest video: ", latestVideo.id.videoId);
      latestVideoId = latestVideo.id.videoId;

      const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
      const preamble = `🚨 WEE WOO WEE WOO 🚨`;
      const new_video_message = `New video just came out! Go give it a watch. *Like, comment, and subscribe too maybe*: ${videoUrl}`;
      client.channels.cache.get(DISCORD_CHANNEL_ID).send(preamble);
      client.channels.cache.get(DISCORD_CHANNEL_ID).send(new_video_message);
      return true;
    } else {
      console.log("No new video. Current latest: ", latestVideoId);
      return false;
    }
  } catch (error) {
    console.error("Failed to fetch the latest video:", error);
    client.channels.cache
      .get(DISCORD_CHANNEL_ID)
      .send("Broski i'm struggling rn. Try me l8r: " + error);
    return;
  }
}

client.login(process.env.BOT_TOKEN);
