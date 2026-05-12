import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum VehicleStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  // owner user id
  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', length: 25 })
  type!: string; // CAR/BIKE/TRUCK/PICKUP etc

  @Column({ type: 'varchar', length: 30, unique: true })
  plateNumber!: string;

  @Column({ type: 'varchar', length: 120 })
  ownerName!: string;

  @Column({ type: 'varchar', length: 30 })
  ownerPhone!: string;

  @Column({ type: 'varchar', length: 500 })
  registrationPdfPath!: string;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.PENDING })
  status!: VehicleStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}