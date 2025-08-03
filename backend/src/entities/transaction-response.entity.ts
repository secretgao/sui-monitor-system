import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('transaction_responses')
export class TransactionResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  digest: string;

  @Column()
  @Index()
  blockNumber: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  transaction: any;

  @Column({ type: 'jsonb', nullable: true })
  effects: any;

  @Column({ type: 'jsonb', nullable: true })
  events: any;

  @Column({ type: 'jsonb', nullable: true })
  objectChanges: any;

  @Column({ type: 'jsonb', nullable: true })
  balanceChanges: any;

  @Column({ type: 'text', nullable: true })
  checkpoint: string;

  @Column({ type: 'text', nullable: true })
  timestampMs: string;

  @Column({ type: 'text', nullable: true })
  confirmedLocalExecution: boolean;

  @Column({ type: 'jsonb', nullable: true })
  rawResponse: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    processedAt: string;
    version: string;
    network: string;
    processingTime?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 