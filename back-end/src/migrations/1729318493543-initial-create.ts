import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreate1729318493543 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(10) NOT NULL, "password" character varying(100) NOT NULL, "email" character varying(100), "first_name" character varying(25), "last_name" character varying(25), "role" character varying(15) NOT NULL DEFAULT 'user', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"));
    CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying(10) NOT NULL, "name" character varying(50) NOT NULL, "description" character varying(255), "address" jsonb NOT NULL DEFAULT '{}', "contact" jsonb NOT NULL DEFAULT '{}', "created_by" uuid NOT NULL, "updated_by" uuid NOT NULL, CONSTRAINT "UQ_80af3e6808151c3210b4d5a2185" UNIQUE ("code"), CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131" UNIQUE ("name"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"));
    CREATE TABLE "units" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying(10) NOT NULL, "name" character varying(50) NOT NULL, "description" character varying(255), "created_by" uuid NOT NULL, "updated_by" uuid NOT NULL, "company_id" uuid NOT NULL, "base_unit_id" uuid, CONSTRAINT "PK_5a8f2f064919b587d93936cb223" PRIMARY KEY ("id"));
    CREATE TABLE "years" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying(10) NOT NULL, "description" character varying(255), "begin_date" date NOT NULL, "end_date" date NOT NULL, "created_by" uuid NOT NULL, "updated_by" uuid NOT NULL, "company_id" uuid NOT NULL, CONSTRAINT "UQ_c2a45b2d59223049037b784d876" UNIQUE ("code"), CONSTRAINT "PK_d6fe7de297533f142df4cb749ab" PRIMARY KEY ("id"));
    ALTER TABLE "companies" ADD CONSTRAINT "FK_ca4df9b8772f1c1a02f3a560555" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "companies" ADD CONSTRAINT "FK_9991d25b571eb593c19f4208fae" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "units" ADD CONSTRAINT "FK_3ed048d577a3cdd2657d884e7d0" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "units" ADD CONSTRAINT "FK_f0c5eef20f466ef090e851b0eed" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "units" ADD CONSTRAINT "FK_3061afe5df76df44acb79d8fc2b" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "units" ADD CONSTRAINT "FK_a41662bc5e9140cf79b61cfa243" FOREIGN KEY ("base_unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "years" ADD CONSTRAINT "FK_b8dd99b213912c6db5c994459b3" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "years" ADD CONSTRAINT "FK_bf89bf3de7e740b6c7351f30b4f" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "years" ADD CONSTRAINT "FK_975aece81a82cc4f8388e22d49b" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`;
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "years" DROP CONSTRAINT "FK_975aece81a82cc4f8388e22d49b";
    ALTER TABLE "years" DROP CONSTRAINT "FK_bf89bf3de7e740b6c7351f30b4f";
    ALTER TABLE "years" DROP CONSTRAINT "FK_b8dd99b213912c6db5c994459b3";
    ALTER TABLE "units" DROP CONSTRAINT "FK_a41662bc5e9140cf79b61cfa243";
    ALTER TABLE "units" DROP CONSTRAINT "FK_3061afe5df76df44acb79d8fc2b";
    ALTER TABLE "units" DROP CONSTRAINT "FK_f0c5eef20f466ef090e851b0eed";
    ALTER TABLE "units" DROP CONSTRAINT "FK_3ed048d577a3cdd2657d884e7d0";
    ALTER TABLE "companies" DROP CONSTRAINT "FK_9991d25b571eb593c19f4208fae";
    ALTER TABLE "companies" DROP CONSTRAINT "FK_ca4df9b8772f1c1a02f3a560555";
    DROP TABLE "years";
    DROP TABLE "units";
    DROP TABLE "companies";
    DROP TABLE "users";`;
    await queryRunner.query(query);
  }
}
