import { database } from '@repo/database';

export const GET = async () => {
  const item = await database.keepAlive.create({
    data: {
      name: 'keep-alive',
    },
  });

  await database.keepAlive.delete({
    where: {
      id: item.id,
    },
  });

  return new Response('OK', { status: 200 });
};
