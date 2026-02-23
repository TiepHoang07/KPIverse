import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActivityService } from '../activity/activity.service.js';
import { CreateKpiDto } from './dto/create-kpi.dto.js';
import { LogKpiDto } from './dto/log-kpi.dto.js';

@Injectable()
export class KpiService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async createPersonalKpi(userId: number, dto: CreateKpiDto) {
    if (dto.scope !== 'PERSONAL') {
      throw new ForbiddenException('Only PERSONAL KPI allowed here');
    }

    const kpi = await this.prisma.kPI.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        scope: 'PERSONAL',
        userId,
        tasks: {
          create: dto.tasks.map((task, index) => ({
            name: task.name,
            order: index,
            scope: 'PERSONAL',
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
    );

    return kpi;
  }

  async getMyPersonalKpis(userId: number) {
    const kpis = await this.prisma.kPI.findMany({
      where: {
        userId,
        scope: 'PERSONAL',
        isActive: true,
      },
      include: { 
        tasks: {
          where: { isActive: true },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // Get log counts for each KPI
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

        const todayLogs = await this.prisma.kPILog.count({
          where: {
            task: {
              kpiId: kpi.id,
            },
            completed: true,
            loggedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        });

        return {
          ...kpi,
          totalLogs: logsCount,
          todayLogs,
        };
      }),
    );

    return kpisWithStats;
  }

  async getOneByUser(userId: number, kpiId: number) {
    const kpi = await this.prisma.kPI.findFirst({
      where: {
        id: kpiId,
        userId,
        groupId: null,
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
      throw new NotFoundException('KPI not found');
    }

    // Get recent logs for this KPI
    const recentLogs = await this.prisma.kPILog.findMany({
      where: {
        task: {
          kpiId: kpi.id,
        },
        completed: true,
      },
      orderBy: { loggedAt: 'desc' },
      take: 10,
      include: {
        task: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...kpi,
      recentLogs,
    };
  }

  async logPersonalTasks(
    userId: number,
    kpiId: number,
    taskIds: number[],
    completed: boolean,
  ) {
    // Verify KPI exists and belongs to user
    const kpi = await this.prisma.kPI.findFirst({
      where: {
        id: kpiId,
        userId,
        scope: 'PERSONAL',
        isActive: true,
      },
      include: {
        tasks: {
          where: {
            id: { in: taskIds },
            isActive: true,
          },
        },
      },
    });

    if (!kpi) {
      throw new NotFoundException('KPI not found or does not belong to you');
    }

    if (kpi.tasks.length !== taskIds.length) {
      throw new BadRequestException('One or more tasks are invalid or inactive');
    }

    // Create logs
    const logs = await this.prisma.kPILog.createMany({
      data: taskIds.map((taskId) => ({
        kpiTaskId: taskId,
        userId,
        scope: 'PERSONAL',
        completed,
      })),
    });

    // Record activity: KPI log (only if completed)
    if (completed && logs.count > 0) {
      await this.activityService.recordKpiLog(
        userId,
        kpi.name,
        taskIds.length,
      );
    }

    return logs;
  }

  async deleteKpi(userId: number, kpiId: number) {
  const kpi = await this.prisma.kPI.findFirst({
    where: {
      id: kpiId,
      userId,
      scope: 'PERSONAL',
    },
    include: {
      tasks: true,
    },
  });

  if (!kpi) {
    throw new NotFoundException('KPI not found or does not belong to you');
  }

  // Delete in a transaction to ensure all related records are deleted
  return this.prisma.$transaction([
    // Delete all KPILogs associated with this KPI's tasks
    this.prisma.kPILog.deleteMany({
      where: {
        task: {
          kpiId,
        },
      },
    }),
    // Delete all KPITasks
    this.prisma.kPITask.deleteMany({
      where: { kpiId },
    }),
    // Delete the KPI itself
    this.prisma.kPI.delete({
      where: { id: kpiId },
    }),
  ]);
}

  // Optional: Get KPI progress/statistics
  async getKpiStats(userId: number, kpiId: number) {
    const kpi = await this.getOneByUser(userId, kpiId);

    const logsByDate = await this.prisma.kPILog.groupBy({
      by: ['loggedAt'],
      where: {
        task: {
          kpiId: kpi.id,
        },
        completed: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        loggedAt: 'desc',
      },
      take: 30,
    });

    return {
      kpi: {
        id: kpi.id,
        name: kpi.name,
        type: kpi.type,
      },
      totalTasks: kpi.tasks.length,
      logsByDate: logsByDate.map(log => ({
        date: log.loggedAt,
        count: log._count.id,
      })),
    };
  }
}