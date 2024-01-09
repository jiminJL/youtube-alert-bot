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
  "Greetings, comrade of camaraderie! Your 'hi' unites us like a rally for joy.",
  "Hello, proletarian of positivity! Your greeting is the people's choice for happiness.",
  "Salutations, vanguard of vivacity! Your 'hi' is more revitalizing than a workers' anthem.",
  "Hi there, revolutionary of radiance! Your presence redistributes joy equally among us.",
  "Greetings, marshal of mirth! Your hello ushers in an era of unparalleled cheer.",
  "Hello, guardian of glee! Your greetings are a beacon of hope in the collective heart.",
  "Hi, pioneer of pleasure! Your words build bridges of happiness across our communal spirit.",
  "Greetings, comrade in cheer! Your 'hi' is like the dawn of a more joyful epoch.",
  "Hello, ambassador of amusement! Your greeting sparks a joyful uprising in our souls.",
  "Hi, leader of laughter! Your greeting rallies the masses to a cause of collective joy.",
];

// Function to randomly pick a flamboyant greeting
function createFlamboyantHello() {
  const randomIndex = Math.floor(Math.random() * flamboyantGreetings.length);
  return flamboyantGreetings[randomIndex] + "✨. It's ya bot, Jo Shoua bot!";
}

const expectedGreetings = [
  "hi",
  "hey",
  "hello",
  "what's up",
  "what's good",
  "whats up",
  "whats good",
  "howdy",
  "what's poppin",
  "greetings",
  "salutations",
];

let canRespondTime = null;

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore messages from bots

  // Check if bot is in pause state
  if (canRespondTime && Date.now() < canRespondTime) {
    if (message.content.toLowerCase() == "!imissu") {
      canRespondTime = null; // Reset the timer on !imissu command
      message.channel.send(
        "Of course you did. I didn't miss you though. But I'm back now. Think twice before sending me away again *comrade*."
      );
    }
    return;
  }

  // Process other commands
  if (message.content.toLowerCase() == "!goaway") {
    canRespondTime = Date.now() + 900000; // 15 minutes from now
    message.channel.send(
      "Ok broski 😔 I'll come back in 15min or when you say `!imissu`. L8er sk8er!"
    );
    return;
  }

  message = message.content.toLowerCase();
  if (message == "!help") {
    ("Here's some commands you can try: \n !checknow - bot checks for new videos right now \n !goaway - bot stops responding for 15min \n !imissu - bot comes back immediately");
  }
  if (message == "!goaway") {
    message.channel.send(
      "Ok broski 😔 I'll come back in 15min or when you say `!imissu`. L8er sk8er!"
    );
    return;
  }
  if (message == "!imissu") {
    message.channel.send(
      "Of course you did. I didn't miss you though. But I'm back now. Think twice before sending me away again *comrade*."
    );
    return;
  }
  if (message == "!checknow") {
    console.log("Checking for new video now...");
    // Check for new video
    const newVideo = await checkForNewVideo();
    // if nothing new sent:
    if (!newVideo) {
      console.log("No new video. Current latest: ", latestVideoId);
      client.channels.cache.get(DISCORD_CHANNEL_ID).send("No new video yet");
    }
    return;
  }

  let isGreeting = expectedGreetings.some((greeting) =>
    message.content.toLowerCase().startsWith(greeting)
  );
  if (isGreeting) {
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
