import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DistributorApplicationStatus } from './distributor-application-status.enum';

@Entity('distributor_applications')
export class DistributorApplication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  ownerName!: string;

  @Column({ type: 'varchar', length: 30 })
  ownerPhone!: string;

  @Column({ type: 'varchar', length: 120 })
  stationName!: string;

  @Column({ type: 'varchar', length: 30 })
  stationPhone!: string;

  @Column({ type: 'varchar', length: 250 })
  address!: string;

  @Column({ type: 'varchar', length: 120 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 500 })
  licensePdfPath!: string;

  @Column({
    type: 'enum',
    enum: DistributorApplicationStatus,
    default: DistributorApplicationStatus.PENDING,
  })
  status!: DistributorApplicationStatus;

  @CreateDateColumn()
  createdAt!: Date;
}