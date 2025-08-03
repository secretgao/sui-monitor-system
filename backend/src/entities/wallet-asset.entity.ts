import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('wallet_assets')
export class WalletAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 66 })
  @Index()
  walletAddress: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  coinType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  symbol: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'int', nullable: true })
  decimals: number;

  @Column({ type: 'decimal', precision: 30, scale: 9, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 20, scale: 9, nullable: true })
  valueUsd: number;

  @Column({ type: 'decimal', precision: 20, scale: 9, nullable: true })
  priceUsd: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  iconUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Wallet, wallet => wallet.address)
  @JoinColumn({ name: 'walletAddress', referencedColumnName: 'address' })
  wallet: Wallet;
} 