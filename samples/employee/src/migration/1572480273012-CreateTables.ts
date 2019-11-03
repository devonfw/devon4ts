import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1572480273012 implements MigrationInterface {
  name = 'CreateTables1572480273012';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" integer NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "username" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "role" integer NOT NULL DEFAULT (0))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "employee" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" integer NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar(255), "surname" varchar(255), "email" varchar(255))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "employee"`, undefined);
    await queryRunner.query(`DROP TABLE "user"`, undefined);
  }
}
