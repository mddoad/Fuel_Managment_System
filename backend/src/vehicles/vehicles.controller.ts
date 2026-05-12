import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
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
import { ApplyVehicleDto } from './dto/apply-vehicle.dto';
import { VehiclesService } from './vehicles.service';

function pdfFileFilter(req: any, file: Express.Multer.File, cb: any) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new BadRequestException('Only PDF files are allowed'), false);
  }
  cb(null, true);
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // USER applies with PDF (pending)
  @Roles(Role.USER)
  @Post('apply')
  @UseInterceptors(
    FileInterceptor('registrationPdf', {
      storage: diskStorage({
        destination: './uploads/vehicle-registrations',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: pdfFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  apply(@Request() req: any, @Body() dto: ApplyVehicleDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vehicle registration PDF is required');
    return this.vehiclesService.apply(req.user.id, dto, file.path);
  }

  // USER sees approved vehicles (My Vehicles)
  @Roles(Role.USER)
  @Get('mine')
  mine(@Request() req: any) {
    return this.vehiclesService.findMineApproved(req.user.id);
  }

  // USER can see all his applications (optional)
  @Roles(Role.USER)
  @Get('mine/all')
  mineAll(@Request() req: any) {
    return this.vehiclesService.findMineAll(req.user.id);
  }

  // ADMIN: pending applications
  @Roles(Role.ADMIN)
  @Get('pending')
  pending() {
    return this.vehiclesService.findPending();
  }

  // ADMIN: view one (to open PDF path)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  // ADMIN: approve / reject
  @Roles(Role.ADMIN)
  @Post(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.approve(id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.reject(id);
  }
}