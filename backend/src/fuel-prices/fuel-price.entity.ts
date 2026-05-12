import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum FuelType {
  OCTANE = 'OCTANE',
  DIESEL = 'DIESEL',
  CNG = 'CNG',
}

@Entity('fuel_prices')
export class FuelPrice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: FuelType, unique: true })
  fuelType!: FuelType;

  @Column({ type: 'float' })
  pricePerUnit!: number; // per liter (for OCTANE/DIESEL) and per unit for CNG (you can treat as per m3)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}