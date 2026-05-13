import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelLog } from '../fuel-logs/fuel-log.entity';
import { FuelPrice } from '../fuel-prices/fuel-price.entity';
import { Station } from '../stations/station.entity';
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
    @InjectRepository(Station) private readonly stationRepo: Repository<Station>,
    @InjectRepository(FuelPrice) private readonly priceRepo: Repository<FuelPrice>,
    @InjectRepository(FuelLog) private readonly logRepo: Repository<FuelLog>,
  ) {}

  async create(userId: number, dto: CreateFuelRequestDto) {
    const [user, vehicle, station] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.vehicleRepo.findOne({ where: { id: dto.vehicleId } }),
      this.stationRepo.findOne({ where: { id: dto.stationId } }),
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.userId !== userId) throw new BadRequestException('This vehicle is not yours');
    if (vehicle.status !== VehicleStatus.APPROVED) throw new BadRequestException('Vehicle is not approved yet');
    if (!station) throw new NotFoundException('Station not found');

    const price = await this.priceRepo.findOne({ where: { fuelType: dto.fuelType as any } });
    if (!price) throw new BadRequestException('Fuel price not set yet');

    const pricePerUnit = Number(price.pricePerUnit);
    const totalCost = Number((dto.amount * pricePerUnit).toFixed(2));

    const req = this.reqRepo.create({
      user,
      vehicle,
      station,
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

  pendingForDistributor() {
    return this.reqRepo.find({
      where: { status: FuelRequestStatus.PENDING },
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
    if (req.status !== FuelRequestStatus.PENDING) throw new BadRequestException('Request is not pending');

    req.status = FuelRequestStatus.ACCEPTED;
    req.acceptedBy = dist;
    req.acceptedAt = new Date();
    return this.reqRepo.save(req);
  }

  async complete(distributorUserId: number, requestId: number) {
    const req = await this.reqRepo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== FuelRequestStatus.ACCEPTED) throw new BadRequestException('Request must be accepted first');
    if (!req.acceptedBy || req.acceptedBy.id !== distributorUserId) {
      throw new BadRequestException('Only the accepting distributor can complete it');
    }

    req.status = FuelRequestStatus.COMPLETED;
    req.completedAt = new Date();
    await this.reqRepo.save(req);

    // Create FuelLog automatically
    const fuelLog = this.logRepo.create({
      createdBy: req.user,
      station: req.station,
      vehicle: req.vehicle,
      date: new Date(),
      liters: req.amount,
      pricePerLiter: req.pricePerUnit,
      totalCost: req.totalCost,
      note: `From request #${req.id} (${req.fuelType})`,
    });

    await this.logRepo.save(fuelLog);

    return { message: 'Request completed and fuel log created', fuelLogId: fuelLog.id };
  }

  async reject(distributorUserId: number, requestId: number) {
    const [dist, req] = await Promise.all([
      this.userRepo.findOne({ where: { id: distributorUserId } }),
      this.reqRepo.findOne({ where: { id: requestId } }),
    ]);
    if (!dist) throw new NotFoundException('Distributor not found');
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== FuelRequestStatus.PENDING) throw new BadRequestException('Only pending requests can be rejected');

    req.status = FuelRequestStatus.REJECTED;
    req.acceptedBy = dist;
    req.acceptedAt = new Date();
    return this.reqRepo.save(req);
  }

  acceptedByDistributor(distributorId: number) {
  return this.reqRepo.find({
    where: { status: FuelRequestStatus.ACCEPTED, acceptedBy: { id: distributorId } },
    order: { id: 'DESC' },
  });
}
}