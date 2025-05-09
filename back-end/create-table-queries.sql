CREATE SEQUENCE booking_id_seq MAXVALUE 9999999 CYCLE;

CREATE TABLE "users" 
(
  "id" uuid NOT NULL, 
  "username" character varying(10) NOT NULL, 
  "email" character varying(100), 
  "first_name" character varying(25), 
  "last_name" character varying(25), 
  "password" character varying(100) NOT NULL, 
  "role" character varying(10) NOT NULL DEFAULT 'user', 
  "is_active" boolean NOT NULL DEFAULT true, 
  "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
  CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), 
  CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);
