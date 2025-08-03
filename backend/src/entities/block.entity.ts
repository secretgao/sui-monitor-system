import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  blockNumber: number;

  @Column({ unique: true })
  @Index()
  blockHash: string;

  @Column()
  @Index()
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  proposer: string;

  @Column({ type: 'int', default: 0 })
  transactionCount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalGasUsed: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalGasCost: number;

  @Column({ type: 'jsonb', nullable: true })
  blockData: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}