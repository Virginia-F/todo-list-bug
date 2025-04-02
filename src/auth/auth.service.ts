import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signIn(signInDto: LoginUserDto): Promise<any> {
        const { pass, email } = signInDto;
        const user = await this.usersService.findOne(email);

        if (!user) {
            this.logger.log(`User with email ${email} not found`);
            throw new UnauthorizedException(
                `User with email ${email} not found`,
            );
        }

        const isHashed =
            user.pass.startsWith('$2b$') || user.pass.startsWith('$2a$');

        let isPasswordValid: boolean;

        if (isHashed) {
            isPasswordValid = bcrypt.compareSync(pass, user.pass);
        } else {
            isPasswordValid = pass === user.pass;
        }

        if (!isPasswordValid) {
            this.logger.log(`Invalid password for user with email ${email}`);
            throw new UnauthorizedException(
                `Invalid password for user with email ${email}`,
            );
        }

        const payload = { id: user.id, email: user.email };

        return {
            access_token: await this.jwtService.signAsync(payload, {
                expiresIn: '1h',
            }),
        };
    }
}
