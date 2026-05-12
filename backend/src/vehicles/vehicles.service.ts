import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './vehicle.entity';
import { ApplyVehicleDto } from './dto/apply-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  async apply(userId: number, dto: ApplyVehicleDto, registrationPdfPath: string) {
    const exists = await this.repo.findOne({ where: { plateNumber: dto.plateNumber } });
    if (exists) throw new BadRequestException('Vehicle already exists with this vehicle number');

    const vehicle = this.repo.create({
      userId,
      type: dto.type,
      plateNumber: dto.plateNumber,
      ownerName: dto.ownerName,
      ownerPhone: dto.ownerPhone,
      registrationPdfPath,
      status: VehicleStatus.PENDING,
    });

    return this.repo.save(vehicle);
  }

  findMineApproved(userId: number) {
    return this.repo.find({
      where: { userId, status: VehicleStatus.APPROVED },
      order: { id: 'DESC' },
    });
  }

  findMineAll(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { id: 'DESC' },
    });
  }

  // admin
  findPending() {
    return this.repo.find({
      where: { status: VehicleStatus.PENDING },
      order: { id: 'DESC' },
    });
  }

  async approve(id: number) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehicle request not found');
    if (v.status !== VehicleStatus.PENDING) throw new BadRequestException('Already processed');
    v.status = VehicleStatus.APPROVED;
    return this.repo.save(v);
  }

  async reject(id: number) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehicle request not found');
    if (v.status !== VehicleStatus.PENDING) throw new BadRequestException('Already processed');
    v.status = VehicleStatus.REJECTED;
    return this.repo.save(v);
  }

  async findOne(id: number) {
    const vehicle = await this.repo.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }
}