import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelPrice, FuelType } from './fuel-price.entity';
import { SetFuelPricesDto } from './dto/set-fuel-prices.dto';

@Injectable()
export class FuelPricesService {
  constructor(@InjectRepository(FuelPrice) private readonly repo: Repository<FuelPrice>) {}

  async list() {
    const rows = await this.repo.find({ order: { fuelType: 'ASC' } });

    // Ensure all types exist (auto-seed)
    const existing = new Set(rows.map((r) => r.fuelType));
    const missing = Object.values(FuelType).filter((t) => !existing.has(t));

    if (missing.length > 0) {
      const created = missing.map((t) =>
        this.repo.create({
          fuelType: t,
          pricePerUnit: 0,
        }),
      );
      await this.repo.save(created);
      return this.repo.find({ order: { fuelType: 'ASC' } });
    }

    return rows;
  }

  async setPrices(dto: SetFuelPricesDto) {
    if (!dto.items || dto.items.length === 0) throw new BadRequestException('No items provided');

    // Upsert each item
    for (const item of dto.items) {
      const row = await this.repo.findOne({ where: { fuelType: item.fuelType } });
      if (!row) {
        await this.repo.save(
          this.repo.create({
            fuelType: item.fuelType,
            pricePerUnit: Number(item.pricePerUnit),
          }),
        );
      } else {
        row.pricePerUnit = Number(item.pricePerUnit);
        await this.repo.save(row);
      }
    }

    return this.list();
  }
}