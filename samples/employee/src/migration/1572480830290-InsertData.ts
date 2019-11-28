import { MigrationInterface, QueryRunner } from 'typeorm';
import { hash, genSalt } from 'bcrypt';
import { roles } from '../app/core/auth/model/roles.enum';

export class InsertData1572480830290 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO EMPLOYEE(id, name, surname, email) VALUES(1, 'Stefano', 'Rossini', 'stefano.rossini@capgemini.com');`,
    );
    await queryRunner.query(
      `INSERT INTO EMPLOYEE(id, name, surname, email) VALUES(2, 'Angelo', 'Muresu', 'angelo.muresu@capgemini.com');`,
    );
    await queryRunner.query(
      `INSERT INTO EMPLOYEE(id, name, surname, email) VALUES(3, 'Jaime', 'Gonzalez', 'jaime.diaz-gonzalez@capgemini.com');`,
    );
    await queryRunner.query(
      `INSERT INTO EMPLOYEE(id, name, surname, email) VALUES(4, 'Dario', 'Rodriguez', 'dario.rodriguez-gonzalez@capgemini.com');`,
    );
    await queryRunner.query(`INSERT INTO USER(id, username, password, role) VALUES(?, ?, ?, ?);`, [
      1,
      'user',
      await hash('password', await genSalt(12)),
      roles.USER,
    ]);
    await queryRunner.query(`INSERT INTO USER(id, username, password, role) VALUES(?, ?, ?, ?);`, [
      2,
      'waiter',
      await hash('waiter', await genSalt(12)),
      roles.USER,
    ]);
    await queryRunner.query(`INSERT INTO USER(id, username, password, role) VALUES(?, ?, ?, ?);`, [
      3,
      'admin',
      await hash('admin', await genSalt(12)),
      roles.ADMIN,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DELETE FROM EMPLOYEE`);
    await queryRunner.query(`DELETE FROM USER`);
  }
}
