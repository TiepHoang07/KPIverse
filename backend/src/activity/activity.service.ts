import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActivityType } from 'src/generated/prisma/enums';
@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  

  // Get user feed (user's activities + friends' activities)
  async getUserFeed(userId: number) {
    // Get user's friends (both sent and received accepted requests)
    const friends = await this.prisma.friend.findMany({
      where: {
        OR: [
          { requester: userId, status: 'ACCEPTED' },
          { receiver: userId, status: 'ACCEPTED' },
        ],
      },
    });

    // Extract friend IDs
    const friendIds = friends.map(friend => 
      friend.requester === userId ? friend.receiver : friend.requester
    );

    // Include user themselves in the feed
    const userIds = [userId, ...friendIds];

    return this.prisma.activity.findMany({
      where: {
        userId: { in: userIds },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
          },
        },
        // group: {
        //   select: {
        //     id: true,
        //     name: true,
        //   },
        // },
      },
    });
  }

  // Get group feed (only group-related activities)
  async getGroupFeed(groupId: number) {
    return this.prisma.activity.findMany({
      where: {
        groupId: groupId,
        type: {
          in: [
            ActivityType.CREATE_GROUP,
            ActivityType.JOIN_GROUP,
            ActivityType.LEAVE_GROUP,
            ActivityType.KPI_CREATED,
            ActivityType.KPI_LOG,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Record KPI creation
  async recordKpiCreated(
    userId: number, 
    kpiName: string, 
    description: string | null, 
    groupId?: number
  ) {
    return this.prisma.activity.create({
      data: {
        userId,
        groupId: groupId || null,
        type: ActivityType.KPI_CREATED,
        kpiName,
        description: description || undefined,
        groupName: groupId ? await this.getGroupName(groupId) : undefined,
      },
    });
  }

  // Record KPI log
  async recordKpiLog(
    userId: number,
    kpiName: string,
    completedTasks: number,
    groupId?: number
  ) {
    return this.prisma.activity.create({
      data: {
        userId,
        groupId: groupId || null,
        type: ActivityType.KPI_LOG,
        kpiName,
        completedTasks,
        groupName: groupId ? await this.getGroupName(groupId) : undefined,
      },
    });
  }

  // Record friend request sent
  async recordFriendRequest(userId: number, targetId: number, targetName: string | null) {
    return this.prisma.activity.create({
      data: {
        userId,
        targetId,
        description: targetName,
        type: ActivityType.REQUEST_ADD_FRIEND,
      },
    });
  }

  // Record friend request accepted
  async recordFriendRequestAccepted(userId: number, targetId: number, targetName: string|null) {
    return this.prisma.activity.create({
      data: {
        userId,
        targetId,
        description: targetName,
        type: ActivityType.FRIEND_REQUEST_ACCEPTED,
      },
    });
  }

  // Record group creation
  async recordGroupCreated(
    userId: number, 
    groupId: number, 
    groupName: string, 
    description?: string
  ) {
    return this.prisma.activity.create({
      data: {
        userId,
        groupId,
        type: ActivityType.CREATE_GROUP,
        groupName,
        description: description || null,
      },
    });
  }

  // Record user joining a group
  async recordGroupJoined(userId: number, groupId: number, groupName: string) {
    // Check if this is the first member (creator) to avoid duplicate CREATE_GROUP activity
    const memberCount = await this.prisma.groupMember.count({
      where: { groupId },
    });

    // If this is the first member, it's the creator - but we already have CREATE_GROUP
    // So we still record JOIN_GROUP for completeness
    return this.prisma.activity.create({
      data: {
        userId,
        groupId,
        type: ActivityType.JOIN_GROUP,
        groupName,
      },
    });
  }

  // Record user leaving a group
  async recordGroupLeft(userId: number, groupId: number, groupName: string) {
    return this.prisma.activity.create({
      data: {
        userId,
        groupId,
        type: ActivityType.LEAVE_GROUP,
        groupName,
      },
    });
  }

  // Helper method to get group name
  private async getGroupName(groupId: number): Promise<string> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });
    return group?.name || 'Unknown Group';
  }

  // Get activities by user
  async getUserActivities(userId: number) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Get activities by type
  async getActivitiesByType(type: ActivityType, limit: number = 50) {
    return this.prisma.activity.findMany({
      where: { type },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}