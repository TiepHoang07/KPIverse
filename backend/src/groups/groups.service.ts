import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(adminId: number, dto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: { name: dto.name, description: dto.description, adminId: adminId },
    });

    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId: adminId },
    });
    return group;
  }

  async joinGroup(userId: number, groupId: number) {
    const exists = await this.prisma.groupMember.findFirst({
      where: { groupId, userId },
    });

    if (exists) throw new BadRequestException('Already member');

    return this.prisma.groupMember.create({ data: { groupId, userId } });
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
}
