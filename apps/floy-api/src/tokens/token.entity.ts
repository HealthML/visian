/* eslint-disable @typescript-eslint/no-inferrable-types */
import shortid from "shortid";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class TokenEntity {
  @PrimaryColumn()
  public token!: string;

  @Column()
  public name!: string;

  @Column()
  public isActive!: boolean;

  @Column()
  public accessCount: number = 0;

  @Column({ nullable: true, type: "timestamp" })
  public lastAccess?: Date;

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

  constructor(token?: Pick<TokenEntity, "name">) {
    if (token) {
      this.name = token.name;
      this.token = shortid.generate();
    }
  }
}
