import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1571244118394 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "user" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "version" integer NOT NULL DEFAULT (1),
          "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
          "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
          "username" varchar(255) NOT NULL, "password" varchar(255) NOT NULL,
          "role" integer NOT NULL DEFAULT (0)
        )`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "todo" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "version" integer NOT NULL DEFAULT (1),
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        "description" text(200) NOT NULL,
        "priority" text NOT NULL DEFAULT ('Normal'),
        "completed" boolean NOT NULL DEFAULT (0)
      )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "todo"`, undefined);
    await queryRunner.query(`DROP TABLE "user"`, undefined);
  }
}
