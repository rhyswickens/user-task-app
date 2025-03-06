import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';
import Fuse from 'fuse.js';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];
  allTasks: Task[] = [];
  private fuse!: Fuse<Task>;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  getTasksFromApi(): Observable<Task[]> {
    const endpointUrl = '/api/tasks';
    return this.http.get<Task[]>(endpointUrl);
  }

  async getTasksFromStorage(): Promise<void> {
    this.allTasks = await this.storageService.getTasks();
    this.tasks = [...this.allTasks];
    this.filterTask('isArchived');
    this.initializeFuse();
  }

  initializeFuse(): void {
    const nonArchivedTasks = this.allTasks.filter((task) => !task.isArchived);
    const options = {
      keys: ['title'],
      threshold: 0.5,
      distance: 100,
      includeScore: false,
    };

    this.fuse = new Fuse(nonArchivedTasks, options);
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
    if (!search) {
      this.tasks = this.allTasks.filter((task) => !task.isArchived);
      return;
    }

    const results = this.fuse.search(search);
    this.tasks = results.map((result) => result.item);
  }
}
