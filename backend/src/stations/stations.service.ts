import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private readonly repo: Repository<Station>,
  ) {}

  create(dto: CreateStationDto) {
    const station = this.repo.create(dto);
    return this.repo.save(station);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const station = await this.repo.findOne({ where: { id } });
    if (!station) throw new NotFoundException('Station not found');
    return station;
  }

  async update(id: number, dto: UpdateStationDto) {
    const station = await this.findOne(id);
    Object.assign(station, dto);
    return this.repo.save(station);
  }

  async remove(id: number) {
    const station = await this.findOne(id);
    await this.repo.remove(station);
    return { deleted: true };
  }
}