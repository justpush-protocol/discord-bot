import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType
} from 'discord.js';
import { isValidAddress } from '../tronweb';
import { Command } from '../types';
import { getUser, setAddress, UserMode } from '../model';

const StartCommand: Command = {
  name: 'start',
  description:
    'Configures your wallet address to recieve push notification via Discord!',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'wallet',
      description: 'Your TRON wallet address to monitor',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    const { id } = interaction.user;
    const wallet = interaction.options.data[0].value as string;
    const validAddress = await isValidAddress(
      wallet,
      process.env.NETWORK as string
    );

    const user = await getUser(id);

    if (user.mode === UserMode.Registered) {
      await interaction.editReply({
        content: `You are already registered. To change your wallet address, please use /change command`
      });
      return;
    }

    if (!validAddress) {
      await interaction.editReply({
        content: 'Invalid wallet address. Please try again'
      });
      return;
    }

    try {
      await client.users.send(
        id,
        `Hello, Setting your wallet address to ${wallet}`
      );
    } catch {
      await interaction.editReply({
        content:
          'Failed to DM you. Please enable DMs from server members and try again'
      });
      return;
    }

    await setAddress(id, wallet);
    await interaction.editReply({
      content: 'You are all set!'
    });
    await client.users.send(
      id,
      'You are all set!. You should recieve push notifications from the groups you are subscribed to directly to your DM by the bot (me).'
    );
  }
};

export default StartCommand;
