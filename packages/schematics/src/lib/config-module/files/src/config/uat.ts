/* istanbul ignore file */
import { PartialDeep } from 'type-fest';
import { Config } from '../app/shared/model/config/config.model';

const def: PartialDeep<Config> = {
  isDev: false,
};

export default def;
