import { Client, CommandInteraction } from 'discord.js';
import { Command } from '../types';
import StartCommand from './start';
import ChangeCommand from './change';

const Commands: Command[] = [StartCommand, ChangeCommand];

export const handleSlashCommand = async (
  client: Client,
  interaction: CommandInteraction
): Promise<void> => {
  const slashCommand = Commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    interaction.followUp({ content: 'An error has occurred' });
    return;
  }

  await interaction.deferReply();

  slashCommand.run(client, interaction);
};

export default Commands;
