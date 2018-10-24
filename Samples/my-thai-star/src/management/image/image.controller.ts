import { Controller } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';

@Controller('imagemanagement/v1')
@ApiUseTags('Image')
export class ImageController {}
