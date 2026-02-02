import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    console.log('➡️ register start');

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    console.log('✅ findUnique done');

    if (existing) {
      throw new ConflictException('Email already used');
    }

    console.log('➡️ hashing password');
    const hashed = await bcrypt.hash(dto.password, 5);
    console.log('✅ hash done');

    console.log('➡️ creating user');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashed,
        name: dto.name,
      },
    });
    console.log('✅ user created');

    console.log('➡️ generating tokens');
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    //check if user exists by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    //check if password is correct
    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
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
