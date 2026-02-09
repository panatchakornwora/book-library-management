import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { RolesGuard } from './auth/roles.guard';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [PrismaModule, AuthModule, BooksModule, LoansModule],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, RolesGuard],
})
export class AppModule {}
