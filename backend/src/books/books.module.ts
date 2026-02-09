import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [BooksController],
  providers: [BooksService, RolesGuard],
})
export class BooksModule {}
