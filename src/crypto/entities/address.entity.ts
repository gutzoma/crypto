// address.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  privateKey: string;

  @Column()
  isMain: boolean;
}
