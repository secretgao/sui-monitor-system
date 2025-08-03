import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('parsed_transactions')
export class ParsedTransaction {
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

  // 钱包地址信息
  @Column()
  sender: string;

  @Column({ type: 'jsonb', nullable: true, name: 'recipients' })
  recipients: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'involved_addresses' })
  involvedAddresses: string[];

  // 交易类型信息
  @Column()
  transactionType: string;

  @Column()
  transactionKind: string;

  @Column({ nullable: true })
  moduleName: string;

  @Column({ nullable: true })
  functionName: string;

  // 代币信息
  @Column({ type: 'jsonb', nullable: true })
  tokens: any[];

  // 余额变化
  @Column({ type: 'jsonb', nullable: true, name: 'balance_changes' })
  balanceChanges: any[];

  // 对象变更
  @Column({ type: 'jsonb', nullable: true, name: 'object_changes' })
  objectChanges: any[];

  // 交易状态
  @Column()
  status: 'success' | 'failure';

  @Column({ nullable: true })
  errorMessage: string;

  // Gas信息
  @Column()
  gasUsed: string;

  @Column()
  gasCost: string;

  // 交易摘要
  @Column({ type: 'text', nullable: true })
  summary: string;

  // 网络信息
  @Column()
  network: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 