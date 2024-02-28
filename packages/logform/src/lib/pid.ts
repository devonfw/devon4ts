import { format } from 'logform';

/**
 *
 */
export const pid = format(info => ({ ...info, pid: process.pid }));
