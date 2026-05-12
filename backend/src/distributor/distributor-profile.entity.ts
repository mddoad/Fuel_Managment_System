import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('distributor_profiles')
export class DistributorProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', unique: true })
  userId!: number;

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

  @Column({ type: 'varchar', length: 500, nullable: true })
  licensePdfPath!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}