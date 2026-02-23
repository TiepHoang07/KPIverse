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
        status: 'PENDING' 
      },
    });

    // Record activity for the sent request
    await this.activityService.recordFriendRequest(requesterId, receiverId);

    return friendRequest;
  }

  async respondRequest(friendId: number, action: 'ACCEPTED' | 'BLOCKED') {
    // Get the friend request details before updating
    const friendRequest = await this.prisma.friend.findUnique({
      where: { id: friendId },
    });

    if (!friendRequest) {
      throw new BadRequestException('Friend request not found');
    }

    // Update the friend request status
    const updatedRequest = await this.prisma.friend.update({
      where: { id: friendId },
      data: { status: action },
    });

    // If accepted, record activity for both users
    if (action === 'ACCEPTED') {
      // Record for the requester (they'll see that their request was accepted)
      await this.activityService.recordFriendRequestAccepted(
        friendRequest.receiver, // The user who accepted
        friendRequest.requester, // The original requester
      );

      // Optional: Also record for the receiver that they accepted
      // You might want this or not depending on your preference
      await this.activityService.recordFriendRequestAccepted(
        friendRequest.requester, // The original requester
        friendRequest.receiver, // The user who accepted
      );
    }

    return updatedRequest;
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

    return accepted.map((f) =>
      f.requester === userId 
        ? { ...f.receiverUser, friendSince: f.createdAt }
        : { ...f.requesterUser, friendSince: f.createdAt },
    );
  }

  // Optional: Get pending friend requests
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

  // Optional: Get sent friend requests
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

  // Optional: Unfriend or cancel request
  async removeFriend(userId: number, friendId: number) {
    const friendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { requester: userId, receiver: friendId },
          { requester: friendId, receiver: userId },
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