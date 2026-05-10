import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelLog } from './fuel-log.entity';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { Station } from '../stations/station.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { User } from '../users/user.entity';

@Injectable()
export class FuelLogsService {
  constructor(
    @InjectRepository(FuelLog) private readonly fuelRepo: Repository<FuelLog>,
    @InjectRepository(Station) private readonly stationRepo: Repository<Station>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(userId: number, dto: CreateFuelLogDto) {
    const [user, station, vehicle] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.stationRepo.findOne({ where: { id: dto.stationId } }),
      this.vehicleRepo.findOne({ where: { id: dto.vehicleId } }),
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!station) throw new NotFoundException('Station not found');
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // optional: sanity check totalCost
    const expected = Number((dto.liters * dto.pricePerLiter).toFixed(2));
    const provided = Number(dto.totalCost.toFixed(2));
    if (Math.abs(expected - provided) > 0.5) {
      throw new BadRequestException(`totalCost looks wrong. Expected about ${expected}`);
    }

    const fuelLog = this.fuelRepo.create({
      createdBy: user,
      station,
      vehicle,
      date: new Date(dto.date),
      liters: dto.liters,
      pricePerLiter: dto.pricePerLiter,
      totalCost: dto.totalCost,
      meterReading: dto.meterReading,
      note: dto.note,
    });

    return this.fuelRepo.save(fuelLog);
  }

  findAll() {
    return this.fuelRepo.find({ order: { id: 'DESC' } });
  }

  findMine(userId: number) {
    return this.fuelRepo.find({
      where: { createdBy: { id: userId } },
      order: { id: 'DESC' },
    });
  }
}