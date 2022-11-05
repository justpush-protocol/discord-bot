import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import Commands, { handleSlashCommand } from './commands';
import { observeNotifcationsOfRegisteredUsers } from './observe';
config();

// bot env variables
const token = process.env.TOKEN;
if (!token) {
  throw new Error('No token provided');
}

// other env variables
const network = process.env.NETWORK;
const tronProAPIKey = process.env.TRON_PRO_API;
const dbURL = process.env.DATABASE_URL;

if (!network) {
  throw new Error('NETWORK is not defined');
}

if (!tronProAPIKey) {
  throw new Error('TRON_PRO_API is not defined');
}

if (!dbURL) {
  throw new Error('DATABASE_URL is not defined');
}

console.log('Bot is starting...');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async () => {
  if (!client.application || !client.user) return;

  // register commands
  client.application.commands.set(Commands);

  console.log(`Ready! Logged in as ${client.user.tag}`);
  observeNotifcationsOfRegisteredUsers(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    await handleSlashCommand(client, interaction);
  }
});
// Log in to Discord with your client's token
client.login(token);
