import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../../storage/storage.service';
import { faker } from '@faker-js/faker';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'take-home-add-component',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  standalone: false,
})
export class AddComponent {
  minDate: Date;
  maxDate: Date;

  protected addTaskForm: FormGroup = new FormGroup({
    title: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(10)],
    }),
    description: new FormControl(null),
    priority: new FormControl(
      { value: TaskPriority.MEDIUM, disabled: false },
      {
        validators: Validators.required,
      },
    ),
    scheduledDate: new FormControl(null, {
      validators: [this.validateScheduledDate],
    }),
  });

  protected priorities = Object.values(TaskPriority);

  constructor(private storageService: StorageService, private router: Router) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.minDate.getDate() + 7);
  }

  validateScheduledDate(control: AbstractControl) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7);
    maxDate.setHours(23, 59, 59, 999);
    return selectedDate >= today && selectedDate <= maxDate
      ? null
      : { invalidDate: true };
  }

  onSubmit() {
    if (this.addTaskForm.invalid) return;

    const newTask: Task = {
      ...this.addTaskForm.getRawValue(),
      uuid: faker.string.uuid(),
      isArchived: false,
    };

    this.storageService.updateTaskItem(newTask);
    this.router.navigateByUrl('/');
  }

  onCancel(): void {
    this.router.navigateByUrl('/');
  }
}
