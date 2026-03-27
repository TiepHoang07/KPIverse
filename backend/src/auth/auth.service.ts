import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
      },
    });

    if (existing) {
      throw new ConflictException('Email already used');
    }

    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const hashed = await bcrypt.hash(dto.password, 5);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashed,
        name: dto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Wrong email or password');
    }

    // Remove passwordHash from user object before passing to generateTokens
    const { passwordHash, ...userWithoutPassword } = user;
    
    return this.generateTokens(userWithoutPassword);
  }

  generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email } as any;

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
