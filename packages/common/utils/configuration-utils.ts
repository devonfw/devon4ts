import { get } from 'config';
import { defaultsDeep } from 'lodash';

export function getConfigProperty(propName: string) {
  let envVar: any;
  let config: any;
  try {
    // Parse JSON object codified as string
    envVar = JSON.parse(process.env[propName]!);
    // If type of envVar is number return directly
    if (typeof envVar === 'number') {
      return envVar;
    }
  } catch (e) {
    // if JSON.parse throws an error it means that it's undefined or
    // it is a regular string, so if it is a string return it
    if (process.env[propName]) {
      return process.env[propName];
    }
  }
  try {
    config = (get('default') as any)[propName];
  } catch (e) {
    config = get(propName);
  }

  // if config and envVar are objects, we combine them and return
  if (typeof config === 'object') {
    return defaultsDeep(envVar, config);
  }
  return config;
}
