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
                bio: true,
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
                bio: true,
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
          // Requests SENT BY current user TO this user
          friendsSent: {
            where: {
              requester: currentUserId,
              receiver: { not: currentUserId }, // Make sure we're looking at the right direction
              status: {
                in: ['PENDING', 'ACCEPTED'],
              },
            },
            select: {
              status: true,
              receiver: true,
            },
          },
          // Requests RECEIVED BY current user FROM this user
          friendsRecv: {
            where: {
              receiver: currentUserId,
              requester: { not: currentUserId }, // Make sure we're looking at the right direction
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
      take: 10,
      orderBy: {
        name: 'asc',
      },
    });

    // If currentUserId is provided, add friendship status
    if (currentUserId) {
      return users.map((user) => {
        // Check if this is the current user
        if (user.id === currentUserId) {
          const { friendsSent, friendsRecv, ...userWithoutFriends } = user;
          return {
            ...userWithoutFriends,
            friendshipStatus: 'YOU',
          };
        }

        // Check if current user sent a request to this user
        const sentRequest = user.friendsSent?.find(
          (f) => f.receiver === user.id,
        );

        // Check if current user received a request from this user
        const receivedRequest = user.friendsRecv?.find(
          (f) => f.requester === user.id,
        );

        let friendshipStatus = 'NONE';

        if (sentRequest) {
          // Current user sent a request to this user
          friendshipStatus =
            sentRequest.status === 'PENDING' ? 'PENDING_SENT' : 'FRIENDS';
        } else if (receivedRequest) {
          // Current user received a request from this user
          friendshipStatus =
            receivedRequest.status === 'PENDING'
              ? 'PENDING_RECEIVED'
              : 'FRIENDS';
        }

        // Also check if they are friends in the opposite direction (just in case)
        if (!sentRequest && !receivedRequest) {
          // You might want to do an additional direct query here if needed
          // But the above should cover all cases
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
