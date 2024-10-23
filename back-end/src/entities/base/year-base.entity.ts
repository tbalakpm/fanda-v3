import { JoinColumn, ManyToOne, BaseEntity } from "typeorm";
import { Year } from "../company/year.entity";

export abstract class YearBaseEntity extends BaseEntity {
  @ManyToOne(() => Year, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "year_id" })
  yearId!: string;
}
