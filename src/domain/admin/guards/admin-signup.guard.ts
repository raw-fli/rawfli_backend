import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminService } from 'src/domain/admin/admin.service';
import { AdminGuard } from './admin.guard';

@Injectable()
export class AdminSignupGuard implements CanActivate {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminGuard: AdminGuard,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hasAdmin = await this.adminService.hasAnyAdmin();
    if (!hasAdmin) return true;

    return this.adminGuard.canActivate(context) as Promise<boolean>;
  }
}
