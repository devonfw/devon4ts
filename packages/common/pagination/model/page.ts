import { PageDetails } from './page-details';

export class Page<T> {
  constructor(public readonly content: T[], public readonly page: PageDetails) {}
}
