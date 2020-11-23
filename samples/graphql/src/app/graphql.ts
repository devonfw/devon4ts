/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class Todo {
  id?: string;
  task?: string;
}

export abstract class IQuery {
  abstract todos(): Todo[] | Promise<Todo[]>;

  abstract todoById(): Todo | Promise<Todo>;
}

export abstract class IMutation {
  abstract createTodo(task?: string): Todo | Promise<Todo>;

  abstract deleteTodo(id?: string): Todo | Promise<Todo>;
}
