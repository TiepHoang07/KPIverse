import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { LogKpiDto } from './dto/log-kpi.dto';

@Injectable()
export class KpiService {
  constructor(private prisma: PrismaService) {}

  async createPersonalKpi(userId: number, dto: CreateKpiDto) {
    if (dto.scope !== 'PERSONAL') {
      throw new ForbiddenException('Only PERSONAL KPI allowed here');
    }

    return this.prisma.kPI.create({
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
  }

  async getMyPersonalKpis(userId: number) {
    return this.prisma.kPI.findMany({
      where: {
        userId,
        scope: 'PERSONAL',
      },
      include: { tasks: true },
    });
  }

  async getOneByUser(userId: number, kpiId: number) {
    const kpi = await this.prisma.kPI.findFirst({
      where: {
        id: kpiId,
        userId,
        groupId: null,
      },
      include: {
        tasks: true,
      },
    });

    if (!kpi) {
      throw new NotFoundException('KPI not found');
    }

    return kpi;
  }

  async logPersonalTasks(
    userId: number,
    kpiId: number,
    taskIds: number[],
    completed: boolean,
  ) {
    return this.prisma.kPILog.createMany({
      data: taskIds.map((taskId) => ({
        kpiTaskId: taskId,
        userId,
        scope: 'PERSONAL',
        completed,
      })),
    });
  }

  async deactivateKpi(userId: number, kpiId: number) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id: kpiId },
    });

    if (!kpi) throw new NotFoundException();
    if (kpi.userId !== userId) throw new ForbiddenException();

    return this.prisma.kPI.update({
      where: { id: kpiId },
      data: { isActive: false },
    });
  }
}
