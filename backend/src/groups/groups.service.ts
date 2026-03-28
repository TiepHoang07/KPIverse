import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActivityService } from '../activity/activity.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { CreateKpiDto } from './dto/create-group-kpi.dto.js';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

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
      joinedAt: m.joinedAt,
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

    // 3. members (without points)
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
      orderBy: { joinedAt: 'desc' }, // Order by join date instead of points
    });

    // 4. group KPIs
    const kpis = await this.prisma.kPI.findMany({
      where: {
        groupId,
        isActive: true,
      },
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // 5. Get recent activity stats for each KPI (optional)
    const kpisWithStats = await Promise.all(
      kpis.map(async (kpi) => {
        const logsCount = await this.prisma.kPILog.count({
          where: {
            task: {
              kpiId: kpi.id,
            },
            completed: true,
          },
        });

        return {
          ...kpi,
          totalLogs: logsCount,
        };
      }),
    );

    return {
      group,
      membership,
      members: members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      kpis: kpisWithStats,
    };
  }

  async getGroupKpiById(groupId: number, kpiId: number, userId: number) {
    // Check if user is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Find the KPI
    const kpi = await this.prisma.kPI.findFirst({
      where: {
        id: kpiId,
        groupId,
        scope: 'GROUP',
        isActive: true,
      },
      include: {
        tasks: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!kpi) {
      throw new NotFoundException('KPI not found in this group');
    }

    // Get recent logs for this KPI (all members)
    const recentLogs = await this.prisma.kPILog.findMany({
      where: {
        task: {
          kpiId: kpi.id,
        },
        groupId,
        completed: true,
      },
      orderBy: { loggedAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        task: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get current user's logs for today/week/month based on KPI type
    const now = new Date();
    let since: Date;

    switch (kpi.type) {
      case 'DAILY':
        since = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'WEEKLY':
        since = new Date(now.setDate(now.getDate() - now.getDay()));
        since.setHours(0, 0, 0, 0);
        break;
      case 'MONTHLY':
        since = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        since = new Date(0); // Beginning of time
    }

    const userLogsThisPeriod = await this.prisma.kPILog.count({
      where: {
        task: {
          kpiId: kpi.id,
        },
        groupId,
        userId,
        completed: true,
        loggedAt: {
          gte: since,
        },
      },
    });

    // Get the last log for this user
    const lastUserLog = await this.prisma.kPILog.findFirst({
      where: {
        task: {
          kpiId: kpi.id,
        },
        groupId,
        userId,
        completed: true,
      },
      orderBy: { loggedAt: 'desc' },
      include: {
        task: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get member progress stats
    const memberProgress = await this.prisma.kPILog.groupBy({
      by: ['userId'],
      where: {
        task: {
          kpiId: kpi.id,
        },
        groupId,
        completed: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const memberIds = memberProgress.map((m) => m.userId);
    const members = await this.prisma.user.findMany({
      where: {
        id: { in: memberIds },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    const topMembers = memberProgress.map((m) => {
      const user = members.find((u) => u.id === m.userId);
      return {
        userId: m.userId,
        name: user?.name,
        avatarUrl: user?.avatarUrl,
        logCount: m._count.id,
      };
    });

    // Get task completion stats
    const taskStats = await this.prisma.kPILog.groupBy({
      by: ['kpiTaskId'],
      where: {
        task: {
          kpiId: kpi.id,
        },
        groupId,
        completed: true,
      },
      _count: {
        id: true,
      },
    });

    const tasksWithStats = kpi.tasks.map((task) => {
      const stat = taskStats.find((s) => s.kpiTaskId === task.id);
      return {
        ...task,
        completionCount: stat?._count.id || 0,
      };
    });

    return {
      ...kpi,
      tasks: tasksWithStats,
      recentLogs,
      userStats: {
        hasLoggedThisPeriod: userLogsThisPeriod > 0,
        logsThisPeriod: userLogsThisPeriod,
        lastLog: lastUserLog,
        canLog: userLogsThisPeriod === 0,
      },
      groupStats: {
        totalLogs: await this.prisma.kPILog.count({
          where: {
            task: {
              kpiId: kpi.id,
            },
            groupId,
            completed: true,
          },
        }),
        uniqueMembers: await this.prisma.kPILog
          .groupBy({
            by: ['userId'],
            where: {
              task: {
                kpiId: kpi.id,
              },
              groupId,
              completed: true,
            },
          })
          .then((groups) => groups.length),
        topMembers,
      },
    };
  }

  async createGroup(userId: number, dto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: { name: dto.name, description: dto.description },
    });

    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId, role: 'ADMIN' },
    });

    // Record activity: group created
    await this.activityService.recordGroupCreated(
      userId,
      group.id,
      group.name,
      group.description || undefined,
    );

    // Record activity: user joined group (the creator)
    await this.activityService.recordGroupJoined(userId, group.id, group.name);

    return group;
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

    if (member?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can create kpi');
    }

    // Get group name for activity
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    // Create KPI
    const kpi = await this.prisma.kPI.create({
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

    // Record activity: KPI created
    await this.activityService.recordKpiCreated(
      userId,
      kpi.name,
      kpi.description,
      groupId,
    );

    return kpi;
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

    if (!member)
      throw new ForbiddenException('You are not a member of this group');

    // Get KPI name for activity
    const kpi = await this.prisma.kPI.findUnique({
      where: { id: kpiId },
      select: { name: true },
    });

    // Create logs
    const logs = await this.prisma.kPILog.createMany({
      data: taskIds.map((taskId) => ({
        kpiTaskId: taskId,
        userId,
        scope: 'GROUP',
        groupId,
        completed,
      })),
    });

    // Record activity: KPI log (only if completed)
    if (completed && logs.count > 0) {
      await this.activityService.recordKpiLog(
        userId,
        kpi?.name || 'Unknown KPI',
        taskIds.length,
        groupId,
      );
    }

    return logs;
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

    const membership = await this.prisma.groupMember.create({
      data: { groupId, userId, role: 'MEMBER' },
    });

    // Record activity: user joined group
    await this.activityService.recordGroupJoined(userId, groupId, group.name);

    return membership;
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
        throw new BadRequestException('Group needs at least one admin');
      }
    }

    // Get group name for activity
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    await this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    // Record activity: user left group
    await this.activityService.recordGroupLeft(
      userId,
      groupId,
      group?.name || 'Unknown Group',
    );

    return { success: true };
  }

  async groupLeaderboard(groupId: number, kpiId: number, limit = 5) {
    // Group logs
    const grouped = await this.prisma.kPILog.groupBy({
      by: ['userId'],
      where: {
        scope: 'GROUP',
        groupId,
        completed: true,
        task: {
          kpi: {
            id: kpiId,
          },
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    if (grouped.length === 0) return [];

    // user info
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: grouped.map((g) => g.userId),
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    const leaderboard = grouped.map((g, index) => {
      const user = users.find((u) => u.id === g.userId);

      return {
        rank: index + 1,
        userId: g.userId,
        name: user?.name || 'Unknown',
        avatarUrl: user?.avatarUrl,
        logs: g._count.id,
      };
    });

    return leaderboard;
  }

  async searchGroups(query: string, userId?: number) {
    if (!query || query.length < 1) {
      return [];
    }

    const groups = await this.prisma.group.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
          },
        },
        // Check if user is a member
        ...(userId && {
          members: {
            where: {
              userId: userId,
            },
            select: {
              role: true,
            },
          },
        }),
      },
      take: 20,
      orderBy: {
        name: 'asc',
      },
    });

    // Add membership status
    if (userId) {
      return groups.map((group) => {
        const isMember = group.members && group.members.length > 0;
        const { members, ...groupWithoutMembers } = group;

        return {
          ...groupWithoutMembers,
          isMember: !!isMember,
          memberRole: isMember ? members[0]?.role : null,
        };
      });
    }

    return groups;
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
      throw new ForbiddenException('Admin cannot remove themselves');
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

    // Get group name for activity
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    await this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    // Record activity: user left group (by being removed)
    await this.activityService.recordGroupLeft(
      targetUserId,
      groupId,
      group?.name || 'Unknown Group',
    );

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

    // Get group name for activity
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    const membership = await this.prisma.groupMember.create({
      data: {
        groupId,
        userId: targetUserId,
        role: 'MEMBER',
      },
    });

    // Record activity: user joined group (by being added)
    await this.activityService.recordGroupJoined(
      targetUserId,
      groupId,
      group?.name || 'Unknown Group',
    );

    return membership;
  }

  async getGroupMembers(groupId: number, requestingUserId: number) {
    // Check if the requesting user is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: requestingUserId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Get group info
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Get all members with their user details
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // Admins first
        { joinedAt: 'asc' }, // Then by join date
      ],
    });

    // Transform to DTO
    const memberDto = members.map(member => ({
      id: member.user.id,
      name: member.user.name || 'Unknown',
      email: member.user.email,
      avatarUrl: member.user.avatarUrl,
      role: member.role,
      joinedAt: member.joinedAt,
    }));

    // Count admins and members
    const adminCount = members.filter(m => m.role === 'ADMIN').length;
    const memberCount = members.filter(m => m.role === 'MEMBER').length;

    return {
      groupId,
      groupName: group.name,
      members: memberDto,
      membership,
      totalCount: members.length,
      adminCount,
      memberCount,
    };
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
