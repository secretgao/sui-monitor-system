import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  digest: string;

  @Column()
  @Index()
  blockNumber: number;

  @Column()
  @Index()
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  sender: string;

  @Column({ type: 'text', nullable: true })
  recipient: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  coinType: string;

  @Column({ type: 'text', nullable: true })
  gasUsed: string;

  @Column({ type: 'text', nullable: true })
  gasPrice: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  gasCost: number;

  @Column({ type: 'text', nullable: true })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  effects: any;

  @Column({ type: 'jsonb', nullable: true })
  events: any;

  @Column({ type: 'text', nullable: true })
  transactionType: string;

  @Column({ type: 'text', nullable: true })
  packageId: string;

  @Column({ type: 'text', nullable: true })
  transactionModule: string;

  @Column({ type: 'text', nullable: true })
  functionName: string;

  @Column({ type: 'jsonb', nullable: true })
  arguments: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}