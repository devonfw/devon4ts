import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class HandlerPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    console.log('Im handler pipe');
    return value;
  }
}
