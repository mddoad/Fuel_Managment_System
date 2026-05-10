import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Station } from '../stations/station.entity';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity()
export class FuelLog {
  @PrimaryGeneratedColumn()
  id!: number;

  // who created the log
  @ManyToOne(() => User, { eager: true })
  createdBy!: User;

  // where fuel was taken
  @ManyToOne(() => Station, { eager: true })
  station!: Station;

  // which vehicle
  @ManyToOne(() => Vehicle, { eager: true })
  vehicle!: Vehicle;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @Column({ type: 'float' })
  liters!: number;

  @Column({ type: 'float' })
  pricePerLiter!: number;

  @Column({ type: 'float' })
  totalCost!: number;

  @Column({ type: 'float', nullable: true })
  meterReading?: number;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}