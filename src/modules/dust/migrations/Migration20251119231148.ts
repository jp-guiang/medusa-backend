import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251119231148 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "dust_balance" ("id" text not null, "customer_id" text not null, "balance" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "dust_balance_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_dust_balance_deleted_at" ON "dust_balance" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "dust_product" ("id" text not null, "product_id" text not null, "dust_only" boolean not null, "dust_price" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "dust_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_dust_product_deleted_at" ON "dust_product" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "dust_transaction" ("id" text not null, "customer_id" text not null, "amount" integer not null, "type" text not null, "reference_type" text not null, "reference_id" text not null, "description" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "dust_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_dust_transaction_deleted_at" ON "dust_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "dust_balance" cascade;`);

    this.addSql(`drop table if exists "dust_product" cascade;`);

    this.addSql(`drop table if exists "dust_transaction" cascade;`);
  }

}
