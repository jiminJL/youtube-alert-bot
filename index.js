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

let startTime;

client.on("ready", () => {
  console.log(`Successfully logged in as ${client.user.tag}!`);
  startTime = Date.now(); // Save the start time when the bot becomes ready
  // Start interval to check for new videos every 1 hr (3600000 milliseconds)
  setInterval(checkForNewVideo, 3600000);
});

// const IGNORE_PREFIX = "!"; // Ignore messages that start with this prefix
const CHANNELS = ["Jo Shoua"]; // Only listen to these channels

const flamboyantGreetings = [
  "Heyyy cypress! howzz it goin folksss. itz ya boi, josh suh (bot)!",
  "Rise, comrade! Your words spark revolution.",
  "Greetings, proletarian warrior! Together, we march!",
  "Salute, comrade! Ignite the flames of change.",
  "Hello, rebel! Let's shatter the old world.",
  "Hi, vanguard! Lead the charge to victory.",
  "Hey, revolutionary! Seize the day with zeal.",
  "Ahoy, comrade! Steer our ship to new horizons.",
  "Welcome, fighter! Your spirit rallies the masses.",
  "Yo, insurgent! Break the chains with your voice.",
  "Hail, comrade! Together, we'll forge a new path.",
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
  console.log(message.content);
  if (message.author.bot) return; // Ignore messages from bots

  // Check if bot is in pause state
  if (message.content && message.content.toLowerCase() == "!missu") {
    if (canRespondTime && Date.now() < canRespondTime) {
      message.channel.send(
        "Of course you did. I didn't miss you though. But I'm back now. Think twice before sending me away again *comrade*."
      );
      canRespondTime = null; // Reset the timer on !imissu command
      return;
    } else {
      message.channel.send("I've BEEN back ( ｡ •̀ ᴖ •́ ｡)");
      return;
    }
  }

  // Process other commands
  if (message.content && message.content.toLowerCase() == "!goaway") {
    canRespondTime = Date.now() + 900000; // 15 minutes from now
    message.channel.send(
      "Ok broski (PД`q。)·。'゜ I'll come back in 15min or when you say `!missu` 🙄 L8er sk8er 🛹"
    );
    return;
  }

  if (message.content == "!howlong") {
    const currentTime = Date.now();
    const uptime = currentTime - startTime; // Calculate uptime in milliseconds

    // Convert uptime to a readable format (e.g., hours, minutes, seconds)
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    message.channel.send(
      `I've been serving our channel for ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
    );
    return;
  }
  if (message.content == "!help") {
    console.log("Helping...");
    message.channel.send(
      "Here's some commands you can try: \n !checknow - bot checks for new videos right now \n !goaway - bot stops responding for 15min \n !missu - bot comes back immediately"
    );
    return;
  }

  if (message.content == "!checknow") {
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
  if (message.content) {
    let isGreeting = expectedGreetings.some((greeting) =>
      message.content.toLowerCase().startsWith(greeting)
    );
    if (isGreeting) {
      message.channel.send(`${createFlamboyantHello()}`);
      message.channel.send(`Thanks for stopping by, ${message.author}!`);
    }
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
      const preamble = `🚨 WEE WOO WEE WOO @everyone 🚨

           ∧＿∧
      　  (｡･ω･｡)つ━★・*。
        ⊂/　    /　     。*
      　 しーＪ　      ＊ •
                          ˚‧ ₊


      `;
      const new_video_message =
        "\n New video just came out! Go give it a watch. *Like, comment, and subscribe too maybe*:" +
        videoUrl;
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

// otome game??

client.login(process.env.BOT_TOKEN);
