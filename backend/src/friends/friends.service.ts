import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(requesterId: number, receiverId: number) {
    if (requesterId === receiverId)
      throw new BadRequestException('Cannot friend yourself');

    const existing = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { requester: requesterId, receiver: receiverId },
          { requester: receiverId, receiver: requesterId },
        ],
      },
    });

    if (existing) throw new BadRequestException('Friend request exists');

    return this.prisma.friend.create({
      data: { requester: requesterId, receiver: receiverId, status: 'PENDING' },
    });
  }

  async respondRequest(friendId: number, action: 'ACCEPTED' | 'BLOCKED') {
    return this.prisma.friend.update({
      where: { id: friendId },
      data: { status: action },
    });
  }

  async listFriends(userId: number) {
    const accepted = await this.prisma.friend.findMany({
      where: {
        OR: [
          { requester: userId, status: 'ACCEPTED' },
          { receiver: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        requesterUser: true,
        receiverUser: true,
      },
    });

    return accepted.map((f) =>
      f.requester === userId ? f.receiverUser : f.requesterUser,
    );
  }
}
