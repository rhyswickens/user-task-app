import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  getTasksFromApi(): Observable<Task[]> {
    const endpointUrl = '/api/tasks';
    return this.http.get<Task[]>(endpointUrl);
  }

  async getTasksFromStorage(): Promise<void> {
    this.tasks = await this.storageService.getTasks();
    this.filterTask('isArchived');
  }

  filterTask(key: keyof Task): void {
    const today = new Date().setHours(0, 0, 0, 0);
    switch (key) {
      case 'isArchived':
        this.tasks = this.tasks.filter((task) => !task.isArchived);
        break;
      case 'priority':
        this.tasks = this.tasks.filter(
          (task) => task.priority === TaskPriority.HIGH,
        );
        break;
      case 'scheduledDate':
        this.tasks = this.tasks.filter((task) => {
          const taskDate = new Date(task.scheduledDate).setHours(0, 0, 0, 0);
          return taskDate === today;
        });
        break;
      case 'completed':
        this.tasks = this.tasks.filter((task) => !task.completed);
        break;
    }
  }

  searchTask(search: string): void {
    if (search) {
      // TODO: filter tasks which title include search value
      throw new Error('Not implemented');
    } else {
      // TODO: reload all tasks from storage
      throw new Error('Not implemented');
    }
  }
}
