import { JoinColumn, ManyToOne } from "typeorm";
import { Company } from "../company.entity";
import { AppBaseEntity } from "./app-base.entity";

export abstract class CompanyBaseEntity extends AppBaseEntity {
  @ManyToOne(() => Company, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  companyId!: string;
}
