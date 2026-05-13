import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributorProfile } from '../distributor/distributor-profile.entity';
import { FuelLog } from '../fuel-logs/fuel-log.entity';
import { FuelPrice } from '../fuel-prices/fuel-price.entity';
import { User } from '../users/user.entity';
import { Vehicle, VehicleStatus } from '../vehicles/vehicle.entity';
import { CreateFuelRequestDto } from './dto/create-fuel-request.dto';
import { FuelRequest, FuelRequestStatus } from './fuel-request.entity';

@Injectable()
export class FuelRequestsService {
  constructor(
    @InjectRepository(FuelRequest) private readonly reqRepo: Repository<FuelRequest>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(FuelPrice) private readonly priceRepo: Repository<FuelPrice>,
    @InjectRepository(FuelLog) private readonly logRepo: Repository<FuelLog>,
    @InjectRepository(DistributorProfile) private readonly distProfileRepo: Repository<DistributorProfile>,
  ) {}

  async create(userId: number, dto: CreateFuelRequestDto) {
    const [user, vehicle] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.vehicleRepo.findOne({ where: { id: dto.vehicleId } }),
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.userId !== userId) throw new BadRequestException('This vehicle is not yours');
    if (vehicle.status !== VehicleStatus.APPROVED) throw new BadRequestException('Vehicle is not approved yet');

    const distProfile = await this.distProfileRepo.findOne({ where: { userId: dto.distributorUserId } });
    if (!distProfile) throw new BadRequestException('Distributor station not found');

    const price = await this.priceRepo.findOne({ where: { fuelType: dto.fuelType as any } });
    if (!price) throw new BadRequestException('Fuel price not set yet');

    const pricePerUnit = Number(price.pricePerUnit);
    const totalCost = Number((dto.amount * pricePerUnit).toFixed(2));

    const req = this.reqRepo.create({
      user,
      vehicle,
      distributorUserId: dto.distributorUserId,
      stationName: distProfile.stationName,
      fuelType: dto.fuelType,
      amount: dto.amount,
      pricePerUnit,
      totalCost,
      status: FuelRequestStatus.PENDING,
    });

    return this.reqRepo.save(req);
  }

  mine(userId: number) {
    return this.reqRepo.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
    });
  }

  pendingForDistributor(distributorUserId: number) {
    return this.reqRepo.find({
      where: { status: FuelRequestStatus.PENDING, distributorUserId },
      order: { id: 'DESC' },
    });
  }

  acceptedByDistributor(distributorUserId: number) {
    return this.reqRepo.find({
      where: { status: FuelRequestStatus.ACCEPTED, distributorUserId, acceptedBy: { id: distributorUserId } },
      order: { id: 'DESC' },
    });
  }

  async accept(distributorUserId: number, requestId: number) {
    const [dist, req] = await Promise.all([
      this.userRepo.findOne({ where: { id: distributorUserId } }),
      this.reqRepo.findOne({ where: { id: requestId } }),
    ]);

    if (!dist) throw new NotFoundException('Distributor not found');
    if (!req) throw new NotFoundException('Request not found');

    if (req.distributorUserId !== distributorUserId) {
      throw new BadRequestException('This request is not for your station');
    }

    if (req.status !== FuelRequestStatus.PENDING) throw new BadRequestException('Request is not pending');

    req.status = FuelRequestStatus.ACCEPTED;
    req.acceptedBy = dist;
    req.acceptedAt = new Date();
    return this.reqRepo.save(req);
  }

  async complete(distributorUserId: number, requestId: number) {
    const req = await this.reqRepo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');

    if (req.distributorUserId !== distributorUserId) {
      throw new BadRequestException('This request is not for your station');
    }

    if (req.status !== FuelRequestStatus.ACCEPTED) throw new BadRequestException('Request must be accepted first');
    if (!req.acceptedBy || req.acceptedBy.id !== distributorUserId) {
      throw new BadRequestException('Only the accepting distributor can complete it');
    }

    req.status = FuelRequestStatus.COMPLETED;
    req.completedAt = new Date();
    await this.reqRepo.save(req);

    // NOTE: FuelLog currently requires Station relation. We cannot create FuelLog here
    // unless we change FuelLog schema too OR map distributor stations to Station table.
    // For now we just complete the request.
    return { message: 'Request completed' };
  }

  async reject(distributorUserId: number, requestId: number) {
    const [dist, req] = await Promise.all([
      this.userRepo.findOne({ where: { id: distributorUserId } }),
      this.reqRepo.findOne({ where: { id: requestId } }),
    ]);

    if (!dist) throw new NotFoundException('Distributor not found');
    if (!req) throw new NotFoundException('Request not found');

    if (req.distributorUserId !== distributorUserId) {
      throw new BadRequestException('This request is not for your station');
    }

    if (req.status !== FuelRequestStatus.PENDING) throw new BadRequestException('Only pending requests can be rejected');

    req.status = FuelRequestStatus.REJECTED;
    req.acceptedBy = dist;
    req.acceptedAt = new Date();
    return this.reqRepo.save(req);
  }
}