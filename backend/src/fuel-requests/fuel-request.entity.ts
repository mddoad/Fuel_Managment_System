import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

export enum FuelRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum FuelType {
  OCTANE = 'OCTANE',
  DIESEL = 'DIESEL',
  CNG = 'CNG',
}

@Entity('fuel_requests')
export class FuelRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @ManyToOne(() => Vehicle, { eager: true })
  vehicle!: Vehicle;

  // who will receive the request
  @Column({ type: 'int' })
  distributorUserId!: number;

  // snapshot station name (from distributor profile)
  @Column({ type: 'varchar', length: 120 })
  stationName!: string;

  @Column({ type: 'enum', enum: FuelType })
  fuelType!: FuelType;

  @Column({ type: 'float' })
  amount!: number;

  @Column({ type: 'float' })
  pricePerUnit!: number;

  @Column({ type: 'float' })
  totalCost!: number;

  @Column({ type: 'enum', enum: FuelRequestStatus, default: FuelRequestStatus.PENDING })
  status!: FuelRequestStatus;

  // distributor who accepted/rejected/completed
  @ManyToOne(() => User, { eager: true, nullable: true })
  acceptedBy?: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}