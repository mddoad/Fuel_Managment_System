import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';

function calcAge(dob: Date) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }

    const dobDate = new Date(dto.dob);
    if (Number.isNaN(dobDate.getTime())) {
      throw new BadRequestException('Invalid date of birth');
    }
    if (calcAge(dobDate) < 18) {
      throw new BadRequestException('You must be at least 18 years old');
    }

    // Uniqueness: email + phone only one time
    const existsEmail = await this.usersService.findByEmail(dto.email);
    if (existsEmail) throw new BadRequestException('Email already exists');

    const existsPhone = await this.usersService.findByPhone(dto.phone);
    if (existsPhone) throw new BadRequestException('Phone already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      dob: dto.dob,
      passwordHash,
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailOrPhone(dto.identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.isActive === false) {
      throw new UnauthorizedException('Account not approved yet');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}