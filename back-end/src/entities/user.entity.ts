import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';
import { UserRoles } from './role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  userId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.userId) this.userId = v7();
  }

  @Column({ length: 25, unique: true })
  username!: string;

  @Column({ length: 100, select: false })
  password!: string;

  @Column({ length: 100, nullable: true })
  email?: string;

  @Column({ length: 25, nullable: true })
  phone?: string;

  @Column({ name: 'first_name', length: 25, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', length: 25, nullable: true })
  lastName?: string;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.USER })
  role!: UserRoles;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
