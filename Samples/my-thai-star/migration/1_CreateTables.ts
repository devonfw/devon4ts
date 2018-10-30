import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1532799941792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.query('CREATE SEQUENCE HIBERNATE_SEQUENCE START WITH 1000000');
    queryRunner.query(`
      CREATE TABLE RestaurantTable (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        seatsNumber INTEGER NOT NULL
      )`);

    queryRunner.query(`
      CREATE TABLE UserProfile (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        username VARCHAR (255) NOT NULL UNIQUE,
        password VARCHAR (255) NOT NULL,
        email VARCHAR (120) NOT NULL UNIQUE,
        role: varchar (120) NOT NULL
      )`);

    queryRunner.query(`
      CREATE TABLE Booking (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        idUser BIGINT,
        name VARCHAR (255) NOT NULL,
        bookingToken VARCHAR (60),
        comment VARCHAR (4000),
        email VARCHAR(255) NOT NULL,
        bookingDate TIMESTAMP NOT NULL,
        expirationDate TIMESTAMP,
        creationDate TIMESTAMP,
        canceled BOOLEAN NOT NULL DEFAULT ((false)) ,
        bookingType INTEGER,
        idTable BIGINT,
        idOrder BIGINT,
        assistants INTEGER,
        CONSTRAINT FK_Booking_idUser FOREIGN KEY(idUser) REFERENCES UserProfile(id),
        CONSTRAINT FK_Booking_idTable FOREIGN KEY(idTable) REFERENCES RestaurantTable(id)
      )`);

    queryRunner.query(`
      CREATE TABLE InvitedGuest (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        idBooking BIGINT NOT NULL,
        guestToken VARCHAR (60),
        email VARCHAR (60),
        accepted BOOLEAN,
        modificationDate TIMESTAMP,
        idOrder BIGINT,
        CONSTRAINT FK_InvitedGuest_idBooking FOREIGN KEY(idBooking) REFERENCES Booking(id)
      )`);

    queryRunner.query(`
      CREATE TABLE Orders (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        idBooking BIGINT NOT NULL,
        idInvitedGuest BIGINT,
        idHost BIGINT,
        CONSTRAINT FK_Order_idBooking FOREIGN KEY(idBooking) REFERENCES Booking(id),
        CONSTRAINT FK_Order_idInvitedGuest FOREIGN KEY(idInvitedGuest) REFERENCES InvitedGuest(id)
      )`);

    queryRunner.query(`
      CREATE TABLE Category (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        name VARCHAR (255),
        description VARCHAR (4000),
        showOrder INTEGER
      )`);

    queryRunner.query(`
      CREATE TABLE Image (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        name VARCHAR(255),
        content TEXT,
        contentType INTEGER,
        mimeType VARCHAR(255)
      )`);

    queryRunner.query(`
      CREATE TABLE Dish (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        name VARCHAR (255),
        description VARCHAR (4000),
        price DECIMAL (16,10),
        idImage BIGINT UNIQUE NOT NULL,
        CONSTRAINT FK_Dish_idImage FOREIGN KEY(idImage) REFERENCES Image(id)
      )`);

    queryRunner.query(`
      CREATE TABLE DishCategory (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        idDish BIGINT NOT NULL,
        idCategory BIGINT NOT NULL,
        CONSTRAINT FK_DishCategory_idDish FOREIGN KEY(idDish) REFERENCES Dish(id),
        CONSTRAINT FK_DishCategory_idCategory FOREIGN KEY(idCategory) REFERENCES Category(id)
      )`);

    queryRunner.query(`
      CREATE TABLE Ingredient (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        name VARCHAR (255),
        description VARCHAR (4000),
        price DECIMAL (16,10)
      )`);

    queryRunner.query(`
      CREATE TABLE DishIngredient (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        idDish BIGINT NOT NULL,
        idIngredient BIGINT NOT NULL,
        CONSTRAINT FK_DishIngredient_idDish FOREIGN KEY(idDish) REFERENCES Dish(id),
        CONSTRAINT FK_DishIngredient_idIngredient FOREIGN KEY(idIngredient) REFERENCES Ingredient(id)
      )`);

    queryRunner.query(`
      CREATE TABLE OrderLine (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        idDish BIGINT NOT NULL,
        amount INTEGER,
        comment VARCHAR (255),
        idOrder BIGINT NOT NULL,
        CONSTRAINT FK_OrderLine_idDish FOREIGN KEY(idDish) REFERENCES Dish(id),
        CONSTRAINT FK_OrderLine_idOrder FOREIGN KEY(idOrder) REFERENCES Orders(id)
      )`);

    queryRunner.query(`
      CREATE TABLE OrderDishExtraIngredient (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER,
        idOrderLine BIGINT NOT NULL,
        idIngredient BIGINT NOT NULL,
        CONSTRAINT FK_OrderDishExtraIngredient_idOrderLine FOREIGN KEY(idOrderLine) REFERENCES OrderLine(id),
        CONSTRAINT FK_OrderDishExtraIngredient_idIngredient FOREIGN KEY(idIngredient) REFERENCES Ingredient(id)
      )`);

    queryRunner.query(`
      CREATE TABLE UserFavourite (
        id SERIAL PRIMARY KEY,
        modificationCounter INTEGER NOT NULL,
        idUser BIGINT NOT NULL,
        idDish BIGINT NOT NULL,
        CONSTRAINT FK_UserFavourite_idUser FOREIGN KEY(idUser) REFERENCES UserProfile(id),
        CONSTRAINT FK_UserFavourite_idDish FOREIGN KEY(idDish) REFERENCES Dish(id)
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    // TODO: implement this
  }
}
