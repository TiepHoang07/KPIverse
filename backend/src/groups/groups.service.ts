import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(userId: number, dto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: { name: dto.name, description: dto.description },
    });

    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId, role: 'ADMIN' },
    });
    return group;
  }

  async joinGroup(userId: number, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }
    const exists = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (exists) throw new BadRequestException('Already member');

    return this.prisma.groupMember.create({
      data: { groupId, userId, role: 'MEMBER' },
    });
  }

  async leaveGroup(userId: number, groupId: number) {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!member) throw new BadRequestException('Not a member');

    if (member.role == 'ADMIN') {
      const adminCount = await this.prisma.groupMember.count({
        where: {
          groupId,
          role: 'ADMIN',
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException('group need at least 1 admin!');
      }
    }

    return this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  }

  async groupLeaderboard(groupId: number, limit = 10) {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true },
    });

    const ranked = members
      .map((m) => ({ user: m.user, points: m.user.points || 0 }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return ranked;
  }

  async ensureGroupAdmin(groupId: number, userId: number) {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Admin permission required');
    }

    return member;
  }

  async removeMember(groupId: number, adminId: number, targetUserId: number) {
    await this.ensureGroupAdmin(groupId, adminId);

    if (adminId == targetUserId) {
      throw new ForbiddenException('Admin cannot remove himself');
    }

    const target = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (!target) {
      throw new NotFoundException('User not in group');
    }

    await this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    return { success: true };
  }

  async addMember(groupId: number, adminId: number, targetUserId: number) {
    await this.ensureGroupAdmin(groupId, adminId);

    const exists = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (exists) {
      throw new ConflictException('User already in group');
    }

    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId: targetUserId,
        role: 'MEMBER',
      },
    });
  }

  async transferAdmin(adminId: number, groupId: number, newAdminId: number) {
    if (adminId == newAdminId) {
      throw new BadRequestException('Cannot transfer admin to yourself');
    }

    const currentAdmin = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: adminId,
        },
      },
    });

    if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can transfer admin role');
    }

    const newAdmin = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: newAdminId,
        },
      },
    });

    if (!newAdmin) {
      throw new BadRequestException('Target user is not a member of the group');
    }

    return this.prisma.$transaction([
      this.prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId: adminId,
          },
        },
        data: { role: 'MEMBER' },
      }),
      this.prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId: newAdminId,
          },
        },
        data: { role: 'ADMIN' },
      }),
    ]);
  }
}
