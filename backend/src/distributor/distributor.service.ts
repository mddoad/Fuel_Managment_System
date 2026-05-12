import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '../auth/role.enum';
import { User } from '../users/user.entity';
import { DistributorApplication } from './distributor-application.entity';
import { DistributorApplicationStatus } from './distributor-application-status.enum';
import { RegisterDistributorDto } from './dto/register-distributor.dto';

@Injectable()
export class DistributorService {
  constructor(
    @InjectRepository(DistributorApplication)
    private readonly appRepo: Repository<DistributorApplication>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(dto: RegisterDistributorDto, licensePdfPath: string) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }

    const existsUser = await this.userRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.ownerPhone }],
    });
    if (existsUser) throw new BadRequestException('Email or phone already exists');

    const existsApp = await this.appRepo.findOne({
      where: [{ email: dto.email }, { ownerPhone: dto.ownerPhone }],
    });
    if (existsApp) throw new BadRequestException('Application already submitted with this email/phone');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const app = this.appRepo.create({
      ownerName: dto.ownerName,
      ownerPhone: dto.ownerPhone,
      stationName: dto.stationName,
      stationPhone: dto.stationPhone,
      address: dto.address,
      email: dto.email,
      passwordHash,
      licensePdfPath,
      status: DistributorApplicationStatus.PENDING,
    });

    await this.appRepo.save(app);

    return {
      message: 'Distributor application submitted. Please wait for admin approval.',
      applicationId: app.id,
      status: app.status,
    };
  }

  async listPending() {
    return this.appRepo.find({
      where: { status: DistributorApplicationStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  async approve(applicationId: number) {
    const app = await this.appRepo.findOne({ where: { id: applicationId } });
    if (!app) throw new BadRequestException('Application not found');

    if (app.status !== DistributorApplicationStatus.PENDING) {
      throw new BadRequestException(`Application already ${app.status}`);
    }

    // Create distributor user account now
    const existing = await this.userRepo.findOne({ where: { email: app.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const user = this.userRepo.create({
      fullName: app.ownerName,
      phone: app.ownerPhone,
      email: app.email,
      dob: null,
      passwordHash: app.passwordHash,
      role: Role.DISTRIBUTOR,
      isActive: true,
    });

    await this.userRepo.save(user);

    app.status = DistributorApplicationStatus.APPROVED;
    await this.appRepo.save(app);

    return { message: 'Distributor approved', distributorUserId: user.id };
  }
  
    async getApplication(id: number) {
    const app = await this.appRepo.findOne({ where: { id } });
    if (!app) throw new BadRequestException('Application not found');
    return app;
  }
}