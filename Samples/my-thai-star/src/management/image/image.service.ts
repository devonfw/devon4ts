import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseService } from 'shared/base.service';
import { Image } from './models/image.entity';
import { ImageVm } from './models/view-models/image-vm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ImageService extends BaseService<Image> {
  constructor(
    @InjectRepository(Image)
    private readonly _imageRepository: Repository<Image>,
  ) {
    super();
    this._repository = _imageRepository;
    process.on('unhandledRejection', error => {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }

  async saveImage(image: ImageVm): Promise<Image> {
    try {
      const imageEntity: Image = await this._imageRepository.create(image);
      return await this._imageRepository.save(imageEntity);
    } catch (error) {
      throw new HttpException(error, error.getStatus());
    }
  }
}
