import {
  Controller,
  Param,
  Get,
  Post,
  Delete,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { ImageVm } from './models/view-models/image-vm';

@Controller('services/rest/imagemanagement/v1/')
@ApiUseTags('Image')
export class ImageController {
  constructor(private readonly _imageService: ImageService) {}

  @Get('image/:id')
  async getImage(@Param('id') id): Promise<ImageVm> {
    try {
      const result = await this._imageService.findById(id);
      if (result) return result;
      else throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    } catch (error) {
      throw new HttpException(error, error.getStatus());
    }
  }

  @Post('image')
  async saveImage(@Body() image: ImageVm): Promise<ImageVm> {
    try {
      await this._imageService.saveImage(image);
      return image;
    } catch (error) {
      throw new HttpException(error, error.getStatus());
    }
  }

  @Delete('/image/:id')
  async deleteImage(@Param('id') id): Promise<boolean> {
    try {
      return !!(await this._imageService.deleteById(id));
    } catch (error) {
      throw new HttpException(error, error.getStatus());
    }
  }
  /* To Implement
    @Post('/image/search')
        async PaginatedListTo < ImageEto > findImagesByPost(ImageSearchCriteriaTo searchCriteriaTo){

        }
        */
}
