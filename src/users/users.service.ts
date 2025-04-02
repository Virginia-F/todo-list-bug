import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto) {
        try {
            const { pass, ...userData } = createUserDto;
            const user = this.usersRepository.create({
                ...userData,
                pass: bcrypt.hashSync(pass, 10),
            });

            await this.usersRepository.save(user);
            delete user.pass;
            return user;
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes('UNIQUE constraint failed: users.fullname')) {
                throw new ConflictException('El email de usuario ya está en uso.');
            }
            throw InternalServerErrorException;
        }
    }

    async findOne(email: string) {
        const user = await this.usersRepository.findOneBy({
            email,
        });

        if (!user) {
            throw new NotFoundException(`Ususario con email ${email} no encontrado`)
        }

        return user;
    }
}
