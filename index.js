require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

// إعدادات Discord Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const TOKEN = process.env.TOKEN;
const GUILD_ID = '1012893019608973382'; // ID الخاص بالسيرفر
const REGISTER_CHANNEL_ID = '1098581919551209622'; // ID الخاص بالشات المحددة لتسجيل الأوامر
const LOG_CHANNEL_ID = '1098766610048749578'; // ID الخاص بالشات المحددة لتسجيل الأعضاء المسجلين
const REMOVE_ROLE_ID = '1098371598731452426'; // ID الرتبة التي سيتم إزالتها
const GIVE_ROLE_ID = '1098833285662134362'; // ID الرتبة التي سيتم إعطاؤها
const REGISTERED_USERS_FILE = 'registered_users.json';
const ADMIN_ID = '826571466815569970'; // ID الخاص بك

let registered_users = {};

if (fs.existsSync(REGISTERED_USERS_FILE)) {
  registered_users = JSON.parse(fs.readFileSync(REGISTERED_USERS_FILE));
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.log("Guild not found!");
    return;
  }

  const register_channel = guild.channels.cache.get(REGISTER_CHANNEL_ID);
  const log_channel = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!register_channel) {
    console.log("Register channel not found!");
    return;
  }
  if (!log_channel) {
    console.log("Log channel not found!");
    return;
  }

  const member = guild.members.cache.get(message.author.id);
  if (!member) {
    console.log("Member not found!");
    return;
  }

  if (message.content === '&reg') {
    if (message.channel.id === REGISTER_CHANNEL_ID) {
      if (registered_users[message.author.id]) {
        message.author.send('You are already registered.');
      } else {
        registered_users[message.author.id] = true;
        fs.writeFileSync(REGISTERED_USERS_FILE, JSON.stringify(registered_users));

        // إعطاء الدور الجديد وإزالة الدور القديم
        const role_to_remove = guild.roles.cache.get(REMOVE_ROLE_ID);
        const role_to_give = guild.roles.cache.get(GIVE_ROLE_ID);
        if (role_to_remove) {
          member.roles.remove(role_to_remove);
        }
        if (role_to_give) {
          member.roles.add(role_to_give);
        }

        // إرسال رسالة تأكيد في الخاص
        message.author.send('You have been successfully registered, and your roles have been updated.');

        // إرسال رسالة إلى الشات المحدد
        const current_time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        log_channel.send(`${message.author} has been successfully registered at ${current_time}.`);
      }
    } else {
      message.author.send(`Please use the registration command in this channel: ${register_channel.toString()}`);
    }
  } else if (message.content.startsWith('&send')) {
    if (message.author.id === ADMIN_ID) {
      register_channel.send("**HeLLo @everyone type &reg to be registered and get <@&1098833285662134362> role**");
    } else {
      message.author.send('You do not have permission to execute this command.');
    }
  }
});

client.login(TOKEN);