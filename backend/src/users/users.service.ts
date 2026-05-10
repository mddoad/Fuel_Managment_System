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

  async createUser(data: {
    fullName: string;
    email: string;
    phone: string;
    passwordHash: string;
  }): Promise<User> {
    const existing = await this.usersRepo.findOne({
      where: [{ email: data.email }, { phone: data.phone }],
    });
    if (existing) throw new ConflictException('Email or phone already exists');

    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }
}