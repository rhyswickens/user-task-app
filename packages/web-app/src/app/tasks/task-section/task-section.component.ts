import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '@take-home/shared';

@Component({
  selector: 'take-home-task-section',
  templateUrl: './task-section.component.html',
  styleUrls: ['./task-section.component.scss'],
  standalone: false,
})
export class TaskSectionComponent {
  @Input() tasks: Task[] = [];
  @Input() title = '';

  @Output() completeTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();

  onComplete(task: Task) {
    this.completeTask.emit(task);
  }

  onDelete(task: Task) {
    this.deleteTask.emit(task);
  }

  getFilteredTasks(): Task[] {
    return this.tasks.sort((a, b) => {
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();

      return dateA - dateB;
    });
  }
}
