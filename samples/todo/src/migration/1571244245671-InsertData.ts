import { MigrationInterface, QueryRunner } from 'typeorm';
import { hash, genSalt } from 'bcrypt';
import { roles } from '../app/core/auth/model/roles.enum';

export class InsertData1571244245671 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('INSERT INTO todo(description) VALUES(?)', [
      'Go to doctor at 17:00PM',
    ]);
    await queryRunner.query('INSERT INTO todo(description) VALUES(?)', [
      'Remember the milk',
    ]);
    await queryRunner.query('INSERT INTO todo(description) VALUES(?)', [
      'Ask the intern to bring me a cup of coffee',
    ]);
    await queryRunner.query('INSERT INTO todo(description) VALUES(?)', [
      'Go to sleep',
    ]);
    await queryRunner.query(
      `INSERT INTO "user"(id, username, password, role) VALUES(?, ?, ?, ?);`,
      [1, 'user', await hash('password', await genSalt(12)), roles.USER],
    );
    await queryRunner.query(
      `INSERT INTO "user"(id, username, password, role) VALUES(?, ?, ?, ?);`,
      [1, 'waiter', await hash('waiter', await genSalt(12)), roles.USER],
    );
    await queryRunner.query(
      `INSERT INTO "user"(id, username, password, role) VALUES(?, ?, ?, ?);`,
      [2, 'admin', await hash('admin', await genSalt(12)), roles.ADMIN],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DELETE FROM "todo"`);
    await queryRunner.query(`DELETE FROM "user"`);
  }
}
