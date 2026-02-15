import prisma from "./prisma";
import { ablyRest } from "./ably";

export async function getOrCreateChatRoom(userId: string) {
  let chatRoom = await prisma.chatRoom.findUnique({
    where: { userId },
    include: {
      participants: { include: { user: true } },
    },
  })

  if (!chatRoom) {
    // const admin = await prisma.user.findFirst({
    //   where: { role: "ADMIN" },
    // })

    // if (!admin) {
    //   throw new Error("No admin available to assign to the chat room.")
    // }

    chatRoom = await prisma.chatRoom.create({
      data: {
        userId,
        participants: {
          create: [{ userId }],
        },
      },
      include: {
        participants: { include: { user: true } },
      },
    })
  }

  return chatRoom
}

export async function sendMessage(senderId: string, roomId: string, message: string) {
  const chatMessage = await prisma.chatMessage.create({
    data: {
      senderId,
      roomId,
      message,
    },
    include: {
      sender: true,
    },
  });

  const channel = ablyRest.channels.get(`chat:${roomId}`);
  await channel.publish("new-message", chatMessage);

  return chatMessage;
}

export async function getMessages(roomId: string, page = 1, limit = 50) {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    include: { sender: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.chatMessage.count({ where: { roomId } });

  return {
    messages: messages.reverse(),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
