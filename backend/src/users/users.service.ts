import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,

        // Personal KPIs
        kpis: {
          where: {
            scope: 'PERSONAL',
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            createdAt: true,
            tasks: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                order: true,
              },
            },
            _count: {
              select: {
                tasks: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },

        // Groups
        memberships: {
          select: {
            role: true,
            joinedAt: true,
            group: {
              select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                _count: {
                  select: {
                    members: true,
                    groupKpis: true,
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },

        // Accepted Friends
        friendsSent: {
          where: {
            status: 'ACCEPTED',
          },
          select: {
            receiverUser: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                email: true,
              },
            },
            createdAt: true,
          },
        },
        friendsRecv: {
          where: {
            status: 'ACCEPTED',
          },
          select: {
            requesterUser: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                email: true,
              },
            },
            createdAt: true,
          },
        },

        // Recent activities
        activities: {
          select: {
            id: true,
            type: true,
            kpiName: true,
            description: true,
            groupName: true,
            completedTasks: true,
            createdAt: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },

        _count: {
          select: {
            kpis: true,
            memberships: true,
            kpilogs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
    };
  }

  async updateProfile(userId: number, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user: any = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const valid = await bcrypt.compare(oldPass, user.passwordHash);

    if (!valid) throw new BadRequestException('wrong old password');

    const newHash = await bcrypt.hash(newPass, 5);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Changed password successfully' };
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }

  async searchUsers(query: string, currentUserId?: number) {
    if (!query || query.length < 1) {
      return [];
    }

    // Check if the query is a number (for ID search)
    const isNumeric = /^\d+$/.test(query);
    const idQuery = isNumeric ? parseInt(query, 10) : undefined;

    // Build the OR conditions array
    const orConditions: any[] = [
      // Search by name (partial match)
      {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      // Search by email (partial match)
      {
        email: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    // Add ID search only if we have a valid number
    if (idQuery !== undefined) {
      orConditions.push({
        id: idQuery, // Simple equality - Prisma understands this
      });
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: orConditions,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        // Check friendship status if currentUserId provided
        ...(currentUserId && {
          friendsSent: {
            where: {
              requester: currentUserId,
              status: {
                in: ['PENDING', 'ACCEPTED'],
              },
            },
            select: {
              status: true,
              receiver: true,
            },
          },
          friendsRecv: {
            where: {
              receiver: currentUserId,
              status: {
                in: ['PENDING', 'ACCEPTED'],
              },
            },
            select: {
              status: true,
              requester: true,
            },
          },
        }),
      },
      orderBy: {
        name: 'asc',
      },
    });

    // If currentUserId is provided, add friendship status
    if (currentUserId) {
      return users.map((user) => {
        const sentRequest = user.friendsSent?.find(
          (f) => f.receiver === user.id,
        );
        const receivedRequest = user.friendsRecv?.find(
          (f) => f.requester === user.id,
        );

        let friendshipStatus = 'NONE';
        if (sentRequest) {
          friendshipStatus =
            sentRequest.status === 'PENDING' ? 'PENDING_SENT' : 'FRIENDS';
        } else if (receivedRequest) {
          friendshipStatus =
            receivedRequest.status === 'PENDING'
              ? 'PENDING_RECEIVED'
              : 'FRIENDS';
        }

        // Remove the friendship arrays from response
        const { friendsSent, friendsRecv, ...userWithoutFriends } = user;

        return {
          ...userWithoutFriends,
          friendshipStatus,
        };
      });
    }

    return users;
  }
}
