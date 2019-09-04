import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class GlobalPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    console.log('Im global pipe');
    return value;
  }
}
