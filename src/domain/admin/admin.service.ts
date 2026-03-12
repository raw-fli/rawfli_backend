import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin, DecodedAdminToken } from 'src/domain/admin/entity/admin.entity';
import { CreateAdminDto } from 'src/domain/admin/dto/create-admin.dto';
import { createError, ErrorCode } from 'src/common/exception/error';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) { }

  async hasAnyAdmin(): Promise<boolean> {
    const count = await this.adminRepository.count();
    return count > 0;
  }

  async createAdmin(dto: CreateAdminDto): Promise<DecodedAdminToken> {
    const existing = await this.adminRepository.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException(createError(ErrorCode.ADMIN_ALREADY_EXISTS));
    }

    const admin = new Admin();
    admin.username = dto.username;
    admin.password = await bcrypt.hash(dto.password, 10);
    const saved = await this.adminRepository.save(admin);

    return { id: saved.id, username: saved.username };
  }

  async validateAdmin(username: string, password: string): Promise<DecodedAdminToken | null> {
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && await bcrypt.compare(password, admin.password)) {
      return { id: admin.id, username: admin.username };
    }
    return null;
  }

  adminLogin(admin: DecodedAdminToken) {
    return this.jwtService.sign({ ...admin });
  }
}
