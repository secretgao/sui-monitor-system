import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 66, unique: true })
  @Index()
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  transactionCount: number;

  @Column({ type: 'int', default: 0 })
  sentTransactionCount: number;

  @Column({ type: 'int', default: 0 })
  receivedTransactionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  firstSeenAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt: Date;

  @Column({ type: 'decimal', precision: 20, scale: 9, default: 0 })
  totalValueUsd: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 