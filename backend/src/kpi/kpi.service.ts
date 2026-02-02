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
      throw new BadRequestException('Invalid KPI scope');
    }

    return this.prisma.kPI.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        target: dto.target,
        scope: dto.scope,
        userId,
      },
    });
  }

  async getMyKpis(userId: number) {
    return this.prisma.kPI.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        logs: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async logKpi(userId: number, kpiId: number, dto: LogKpiDto) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id: kpiId },
    });

    if (!kpi) throw new NotFoundException('KPI not found');
    if (kpi.userId !== userId) throw new ForbiddenException('Not your KPI');

    await this.prisma.kPILog.create({
      data: {
        kpiId,
        userId,
        value: dto.value,
        date: new Date(),
      },
    });

    const sum = await this.prisma.kPILog.aggregate({
      where: { kpiId },
      _sum: { value: true },
    });

    const total = sum._sum.value || 0;

    if (total >= kpi.target) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: 1 },
        },
      });
    }

    return { message: 'Logged successfully', total };
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

  async createGroupKpi(userId: number, groupId: number, dto: CreateKpiDto) {
    if (dto.scope !== 'GROUP') {
      throw new BadRequestException('Scope must be GROUP');
    }

    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!member) throw new ForbiddenException('Not a group member');

    if (member.role !== 'ADMIN')
      throw new ForbiddenException('Only admin can create KPI');

    return this.prisma.kPI.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        target: dto.target,
        scope: dto.scope,
        groupId,
      },
    });
  }

  async getGroupKpis(userId: number, groupId: number) {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!member) throw new ForbiddenException('Not a group member');

    return this.prisma.kPI.findMany({
      where: {
        groupId,
        isActive: true,
      },
      include: {
        logs: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async logGroupKpi(userId: number, kpiId: number, dto: LogKpiDto) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id: kpiId },
    });

    if (!kpi || !kpi.groupId)
      throw new NotFoundException('Group KPI not found');

    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: kpi.groupId,
          userId,
        },
      },
    });

    if (!member) throw new ForbiddenException('Not group member');

    await this.prisma.kPILog.create({
      data: {
        kpiId,
        userId,
        value: dto.value,
        date: new Date(),
      },
    });

    const sum = await this.prisma.kPILog.aggregate({
      where: {
        kpiId,
        userId,
      },
      _sum: { value: true },
    });

    const total = sum._sum.value || 0;

    if (total >= kpi.target) {
      await this.prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId: kpi.groupId,
            userId,
          },
        },
        data: {
          points: { increment: 1 },
        },
      });
    }

    return { message: 'Logged group KPI', total };
  }
}
