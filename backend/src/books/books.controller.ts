import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { mkdirSync } from 'fs';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateBookDocument } from './documents/create-book.document';
import { DeleteBookDocument } from './documents/delete-book.document';
import { GetBookByIdDocument } from './documents/get-book-by-id.document';
import { GetBookListDocument } from './documents/get-book-list.document';
import { UpdateBookDocument } from './documents/update-book.document';
import { UpdateBookQuantityDto } from './dto/update-book-quantity.dto';
import { UpdateBookQuantityDocument } from './documents/update-book-quantity.document';
import { GetMostBorrowedBooksDocument } from './documents/get-most-borrowed-books.document';
import { UploadBookCoverDocument } from './documents/upload-book-cover.document';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private books: BooksService) {}

  @Get()
  @GetBookListDocument()
  list(
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = page ? Number(page) : 1;
    const ps = pageSize ? Number(pageSize) : 20;
    return this.books.list(query, p, ps);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @Get('most-borrowed')
  @GetMostBorrowedBooksDocument()
  mostBorrowed(@Query('limit') limit?: string) {
    const safeLimit = limit ? Number(limit) : 5;
    return this.books.mostBorrowed(safeLimit);
  }

  @Get(':id')
  @GetBookByIdDocument()
  getById(@Param('id') id: string) {
    return this.books.getById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @Post()
  @CreateBookDocument()
  create(@Body() dto: CreateBookDto) {
    return this.books.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @Post('cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads');
          mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '');
          const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed'), false);
        }
        return cb(null, true);
      },
    }),
  )
  @UploadBookCoverDocument()
  uploadCover(@UploadedFile() file: Express.Multer.File) {
    return this.books.uploadCover(file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @Put(':id')
  @UpdateBookDocument()
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.books.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @Delete(':id')
  @HttpCode(204)
  @DeleteBookDocument()
  async remove(@Param('id') id: string) {
    await this.books.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @Patch(':id/quantity')
  @UpdateBookQuantityDocument()
  updateQuantity(@Param('id') id: string, @Body() dto: UpdateBookQuantityDto) {
    return this.books.removeQuantity(id, dto.quantity);
  }
}
