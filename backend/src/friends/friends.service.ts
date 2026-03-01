import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActivityService } from '../activity/activity.service.js';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

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

    // Create friend request
    const friendRequest = await this.prisma.friend.create({
      data: {
        requester: requesterId,
        receiver: receiverId,
        status: 'PENDING',
      },
      include: {
        receiverUser: {
          select: {
            name: true,
          },
        },
      },
    });

    // Record activity for the sent request
    await this.activityService.recordFriendRequest(requesterId, receiverId, friendRequest.receiverUser.name);

    return friendRequest;
  }

  async respondRequest(
    friendId: number,
    userId: number,
    action: 'ACCEPT' | 'REJECT',
  ) {
    // Find the pending request where current user is the receiver
    const friendRequest = await this.prisma.friend.findFirst({
      where: {
        id: friendId,
        receiver: userId,
        status: 'PENDING',
      },
      include: {
        requesterUser: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!friendRequest) {
      throw new BadRequestException('Friend request not found');
    }

    // Handle REJECT action
    if (action === 'REJECT') {
      return this.prisma.friend.delete({
        where: { id: friendId },
      });
    }

    // Handle ACCEPT action
    const updatedRequest = await this.prisma.friend.update({
      where: { id: friendId },
      data: { status: 'ACCEPTED' },
    });

    // Record activity for both users
    await this.activityService.recordFriendRequestAccepted(
      friendRequest.receiver,
      friendRequest.requester,
      friendRequest.requesterUser.name,
    );

    return updatedRequest;
  }

  // Cancel a sent request
  async cancelRequest(friendId: number, userId: number) {
    const friendRequest = await this.prisma.friend.findFirst({
      where: {
        id: friendId,
        requester: userId,
        status: 'PENDING',
      },
    });

    if (!friendRequest) {
      throw new BadRequestException('Sent request not found');
    }

    return this.prisma.friend.delete({
      where: { id: friendId },
    });
  }

  async listFriends(userId: number) {
    const friends = await this.prisma.friend.findMany({
      where: {
        OR: [
          { requester: userId, status: 'ACCEPTED' },
          { receiver: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        requesterUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        receiverUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return friends.map((f) => {
      const friendData =
        f.requester === userId ? f.receiverUser : f.requesterUser;
      return {
        ...friendData,
        friendSince: f.createdAt,
      };
    });
  }

  async getPendingRequests(userId: number) {
    return this.prisma.friend.findMany({
      where: {
        receiver: userId,
        status: 'PENDING',
      },
      include: {
        requesterUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getSentRequests(userId: number) {
    return this.prisma.friend.findMany({
      where: {
        requester: userId,
        status: 'PENDING',
      },
      include: {
        receiverUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async removeFriend(userId: number, friendId: number) {
    const friendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { requester: userId, receiver: friendId, status: 'ACCEPTED' },
          { requester: friendId, receiver: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!friendship) {
      throw new BadRequestException('Friendship not found');
    }

    return this.prisma.friend.delete({
      where: { id: friendship.id },
    });
  }
}
