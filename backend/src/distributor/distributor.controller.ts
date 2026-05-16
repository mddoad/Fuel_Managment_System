import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Request,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RegisterDistributorDto } from './dto/register-distributor.dto';
import { DistributorService } from './distributor.service';

function pdfFileFilter(req: any, file: Express.Multer.File, cb: any) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new BadRequestException('Only PDF files are allowed'), false);
  }
  cb(null, true);
}

@Controller('distributors')
export class DistributorController {
  constructor(private readonly distributorService: DistributorService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('licensePdf', {
      storage: diskStorage({
        destination: './uploads/licenses',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: pdfFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async register(@Body() dto: RegisterDistributorDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('License PDF is required');
    return this.distributorService.register(dto, file.path);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('applications/pending')
  pending() {
    return this.distributorService.listPending();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('applications/:id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.distributorService.getApplication(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('applications/:id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.distributorService.approve(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.DISTRIBUTOR)
  @Get('me')
  me(@Request() req: any) {
    return this.distributorService.getMyProfile(req.user.id);
  }
}