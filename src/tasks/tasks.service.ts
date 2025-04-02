import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) {}

    async listTasks(ownerId: string) {
        const tasks = await this.tasksRepository
            .createQueryBuilder('task')
            .where('task.ownerId = :ownerId', { ownerId })

            .getMany();

        return tasks;
    }

    async getTask(taskId: string, ownerId: string) {
        const task = await this.tasksRepository
            .createQueryBuilder('task')
            .where('task.ownerId = :ownerId', { ownerId })
            .andWhere('task.id = :taskId', { taskId })
            .getOne();
        if (!task) {
            throw new NotFoundException(
                'Tarea no encontrada o no tienes permisos para verla',
            );
        }
        return task;
    }

    async editTask(body: any, ownerId: string) {
        const existingTask = await this.getTask(body.id, ownerId);

        if (!existingTask) {
            throw new NotFoundException(
                'Tarea no encontrada o no tienes permisos para editarla',
            );
        }

        await this.tasksRepository.update(body.id, body);

        return await this.getTask(body.id, ownerId);
    }
}
