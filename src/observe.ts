import { getAllRegisteredUsers } from './model';
import { getTronWeb } from './tronweb';
import { JustPush } from '@justpush/sdk';
import { User } from '@prisma/client';
import { Client } from 'discord.js';

export const observeNotifcationsOfRegisteredUsers = async (client: Client) => {
  const tronweb = getTronWeb(process.env.NETWORK || 'shasta');
  const justPush = new JustPush(tronweb);

  interface ObservingUsers {
    [key: string]: boolean;
  }

  let alreadyObserving: ObservingUsers = {};
  const userListPollingInterval = 1000 * 5;

  const observeAllUsers = async () => {
    const users = await getAllRegisteredUsers();
    const usersToObserve = users.filter((user) => !alreadyObserving[user.id]);
    usersToObserve.forEach((user) => {
      observeUser(user, client, justPush);
      alreadyObserving[user.id] = true;
    });
  };

  const timeOutId = setTimeout(observeAllUsers, userListPollingInterval);
};

export const observeUser = (user: User, client: Client, justPush: JustPush) => {
  console.log('Observing user: ', user.wallet);
  if (!user.wallet) {
    console.log('User wallet not set: ', user.id);
    return;
  }
  justPush.monitorNotifcations(user.wallet as string).subscribe((result) => {
    if (result.errors) {
      console.error('Error observing', result.errors);
    }

    if (result.data && result.data.notificationAdded) {
      const { data, group } = result.data.notificationAdded;
      client.users.send(
        user.id,
        `New notification from **${group.name}**\n\n` +
          `**${data.title}**\n${data.content}\n${
            data.link ? 'More Info: ' + data.link : ''
          }`
      );
    }
  });
};
