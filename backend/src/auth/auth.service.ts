import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface TokenPayload {
  sub: string;
  email: string;
  role?: string;
  jti?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly jwtAccessSecret =
    process.env.JWT_SECRET || 'ftodo-super-secret-jwt-access-key-2026-production';
  private readonly jwtRefreshSecret =
    process.env.JWT_REFRESH_SECRET || 'ftodo-super-secret-jwt-refresh-key-2026-production';
  private readonly accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  private readonly refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: dto.name.trim(),
        role: 'USER',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Đăng ký tài khoản thành công',
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tài khoản đã bị tạm khóa. Vui lòng liên hệ quản trị viên');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại');
    }

    const tokenSha = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const isMatch = await bcrypt.compare(tokenSha, user.hashedRefreshToken);
    if (!isMatch) {
      // Token Reuse Detection / Theft Defense: Invalidate token family immediately!
      await this.prisma.user.update({
        where: { id: user.id },
        data: { hashedRefreshToken: null },
      });
      throw new UnauthorizedException(
        'Phát hiện hành vi sử dụng lại token trái phép. Toàn bộ phiên đăng nhập đã bị hủy',
      );
    }

    // Refresh Token Rotation: issue brand new access token and refresh token
    const newTokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateHashedRefreshToken(user.id, newTokens.refreshToken);

    return newTokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });

    return {
      message: 'Đăng xuất thành công, phiên đăng nhập đã được hủy',
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin tài khoản');
    }

    return user;
  }

  private async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const accessPayload: TokenPayload = {
      sub: userId,
      email,
      role,
      jti: crypto.randomUUID(),
    };
    const refreshPayload: TokenPayload = {
      sub: userId,
      email,
      jti: crypto.randomUUID(),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.jwtAccessSecret,
        expiresIn: this.accessExpiresIn as any,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.jwtRefreshSecret,
        expiresIn: this.refreshExpiresIn as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateHashedRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenSha = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(tokenSha, salt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashed },
    });
  }
}
