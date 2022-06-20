import { Controller, ControllerOptions } from '@nestjs/common';

export function Handler(): ClassDecorator;
export function Handler(prefix: string | string[]): ClassDecorator;
export function Handler(options: ControllerOptions): ClassDecorator;
export function Handler(prefixOrOptions?: string | string[] | ControllerOptions): ClassDecorator {
  return Controller(prefixOrOptions as ControllerOptions);
}
