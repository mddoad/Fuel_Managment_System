import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '../auth/role.enum';
import { DistributorProfile } from '../distributor/distributor-profile.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AdminCreateDistributorDto } from './dto/admin-create-distributor.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

function calcAge(dob: Date) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(DistributorProfile) private readonly profileRepo: Repository<DistributorProfile>,
  ) {}

  async createUser(dto: AdminCreateUserDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }

    const existsEmail = await this.usersService.findByEmail(dto.email);
    if (existsEmail) throw new BadRequestException('Email already exists');

    const existsPhone = await this.usersService.findByPhone(dto.phone);
    if (existsPhone) throw new BadRequestException('Phone already exists');

    if (dto.role === Role.ADMIN || dto.role === Role.USER) {
      if (!dto.dob) throw new BadRequestException('DOB is required');
      const dobDate = new Date(dto.dob);
      if (Number.isNaN(dobDate.getTime())) throw new BadRequestException('Invalid date of birth');
      if (calcAge(dobDate) < 18) throw new BadRequestException('You must be at least 18 years old');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      dob: dto.role === Role.DISTRIBUTOR ? null : (dto.dob ?? null),
      passwordHash,
      role: dto.role,
      isActive: true,
    });

    return { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role };
  }

  async createDistributor(dto: AdminCreateDistributorDto, licensePdfPath: string) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }

    // uniqueness
    const existsUser = await this.usersRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.ownerPhone }],
    });
    if (existsUser) throw new BadRequestException('Email or phone already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // create distributor user (active immediately)
    const user = this.usersRepo.create({
      fullName: dto.ownerName,
      email: dto.email,
      phone: dto.ownerPhone,
      dob: null,
      passwordHash,
      role: Role.DISTRIBUTOR,
      isActive: true,
    });
    await this.usersRepo.save(user);

    // create distributor profile
    const profile = this.profileRepo.create({
      userId: user.id,
      ownerName: dto.ownerName,
      ownerPhone: dto.ownerPhone,
      stationName: dto.stationName,
      stationPhone: dto.stationPhone,
      address: dto.address,
      licensePdfPath,
    });
    await this.profileRepo.save(profile);

    return { message: 'Distributor created', distributorUserId: user.id };
  }
}