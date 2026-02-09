import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateKpiDto } from './dto/create-group-kpi.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async getMyGroups(userId: number) {
    const memberships = await this.prisma.groupMember.findMany({
      where: {
        userId,
      },
      include: {
        group: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      role: m.role,
      membersCount: m.group._count.members,
    }));
  }

  async getGroupDashboard(groupId: number, userId: number) {
    // 1. check membership
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // 2. group info
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // 3. members
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { points: 'desc' },
    });

    // 4. group KPIs
    const kpis = await this.prisma.kPI.findMany({
      where: {
        groupId,
        isActive: true,
      },
    });

    return {
      group,
      members: members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        points: m.points,
      })),
      kpis,
      leaderboard: members.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl,
        points: m.points,
      })),
    };
  }

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

  async createGroupKpi(userId: number, groupId: number, dto: CreateKpiDto) {
    if (dto.scope !== 'GROUP') {
      throw new ForbiddenException('Only GROUP KPI allowed here');
    }

    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!member) throw new ForbiddenException('Not a group member');

    return this.prisma.kPI.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        scope: 'GROUP',
        groupId,
        tasks: {
          create: dto.tasks.map((task, index) => ({
            name: task.name,
            order: index,
            scope: 'GROUP',
            groupId,
          })),
        },
      },
      include: { tasks: true },
    });
  }

  async logGroupTasks(
    userId: number,
    groupId: number,
    kpiId: number,
    taskIds: number[],
    completed: boolean,
  ) {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!member) throw new ForbiddenException();

    return this.prisma.kPILog.createMany({
      data: taskIds.map((taskId) => ({
        kpiTaskId: taskId,
        userId,
        scope: 'GROUP',
        groupId,
        completed,
      })),
    });
  }
}
