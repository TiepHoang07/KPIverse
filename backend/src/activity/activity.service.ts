import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}
  async getFeed(userId: number) {
    return this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        likes: true,
      },
    });
  }

  async like(activityId: number, userId: number) {
    const exists = await this.prisma.activityLike.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId,
        },
      },
    });

    if (exists) {
      return this.prisma.activityLike.delete({
        where: {
          activityId_userId: {
            activityId,
            userId,
          },
        },
      });
    }

    return this.prisma.activityLike.create({
      data: {
        activityId,
        userId,
      },
    });
  }
}
