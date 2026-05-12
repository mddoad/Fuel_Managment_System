import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/role.enum';
import { AdminService } from './admin.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminCreateDistributorDto } from './dto/admin-create-distributor.dto';

function pdfFileFilter(req: any, file: Express.Multer.File, cb: any) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new BadRequestException('Only PDF files are allowed'), false);
  }
  cb(null, true);
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('users')
  createUser(@Body() dto: AdminCreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('distributors')
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
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  createDistributor(@Body() dto: AdminCreateDistributorDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('License PDF is required');
    return this.adminService.createDistributor(dto, file.path);
  }
}