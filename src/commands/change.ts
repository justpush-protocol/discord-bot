import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType
} from 'discord.js';
import { isValidAddress } from '../tronweb';
import { Command } from '../types';
import { getUser, setAddress, UserMode } from '../model';

const ChangeCommand: Command = {
  name: 'change',
  description:
    'Changes your wallet address to recieve push notification via Discord!',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'wallet',
      description: 'Your updated TRON wallet address to monitor',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    const { username, id } = interaction.user;
    const wallet = interaction.options.data[0].value as string;
    const validAddress = isValidAddress(wallet, process.env.NETWORK as string);

    const user = await getUser(id);

    if (user.mode === UserMode.NewUser) {
      await interaction.editReply({
        content: `You are new, please use /start command`
      });
      return;
    }

    if (!validAddress) {
      await interaction.editReply({
        content: 'Invalid wallet address. Please try again.'
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
          'Failed to DM you. Please enable DMs from server members. Then try again.'
      });
      return;
    }

    await setAddress(id, wallet);
    await interaction.followUp({
      ephemeral: true,
      content: 'You are all set!'
    });

    await client.users.send(
      id,
      'You are all set!. You should recieve push notifications from the groups you are subscribed to directly to your DM by the bot (me).'
    );
  }
};

export default ChangeCommand;
