import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorators';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Get('')
    @UseGuards(AuthGuard)
    async listTasks(@GetUser('id') ownerId: string) {
        return this.tasksService.listTasks(ownerId);
    }

    @Get('/:id')
    @UseGuards(AuthGuard)
    async getTask(@Param('id') taskId: string, @GetUser('id') ownerId: string) {
        return this.tasksService.getTask(taskId, ownerId);
    }

    @Post('/edit')
    @UseGuards(AuthGuard)
    async editTask(@Body() body: any, @GetUser('id') ownerId: string) {
        return this.tasksService.editTask(body, ownerId);
    }
}
