import { Component } from '@angular/core';

import { Task } from '@take-home/shared';
import { take } from 'rxjs';
import { TasksService } from '../tasks.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'take-home-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false,
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router,
  ) {
    this.getTaskList();
  }

  onDoneTask(item: Task): void {
    item.completed = true;
    this.storageService.updateTaskItem(item);
    this.getTaskList();
  }

  onDeleteTask(item: Task): void {
    item.isArchived = true;
    this.storageService.updateTaskItem(item);
    this.getTaskList();
  }

  onAddTask(): void {
    this.router.navigate(['/add']);
  }

  getTaskList(): void {
    this.tasksService
      .getTasksFromApi()
      .pipe(take(1))
      .subscribe(async (tasks) => {
        tasks = tasks.filter((task) => !task.isArchived);
        tasks.forEach(async (task) => {
          await this.storageService.updateTaskItem(task);
        });
        await this.tasksService.getTasksFromStorage();
      });
  }

  get incompleteTasks(): Task[] {
    return this.tasksService.tasks.filter((task) => !task.completed);
  }

  get completedTasks(): Task[] {
    return this.tasksService.tasks.filter((task) => task.completed);
  }
}
