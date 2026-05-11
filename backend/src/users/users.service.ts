import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { phone } });
  }

  async createUser(data: {
    fullName: string;
    email: string;
    phone: string;
    dob?: string | null;
    passwordHash: string;
    role?: any;
    isActive?: boolean;
  }): Promise<User> {
    const existing = await this.usersRepo.findOne({
      where: [{ email: data.email }, { phone: data.phone }],
    });
    if (existing) throw new ConflictException('Email or phone already exists');

    const user = this.usersRepo.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      dob: data.dob ?? null,
      passwordHash: data.passwordHash,
      role: data.role,
      isActive: data.isActive ?? true,
    });

    return this.usersRepo.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }
}