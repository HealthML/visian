/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TokenEntity } from "./token.entity";

@Entity()
export class ConsentEntity {
  @PrimaryGeneratedColumn()
  public id!: string;

  @ManyToOne(() => TokenEntity)
  public token!: TokenEntity;

  @Column({ nullable: true })
  public ip!: string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  public updatedAt!: Date;

  constructor(consent?: Pick<ConsentEntity, "token" | "ip">) {
    if (consent) {
      this.token = consent.token;
      this.ip = consent.ip;
    }
  }
}
