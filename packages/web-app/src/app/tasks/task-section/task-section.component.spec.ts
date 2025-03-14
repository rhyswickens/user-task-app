import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskSectionComponent } from './task-section.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskPriority, generateTask } from '@take-home/shared';
import { By } from '@angular/platform-browser';

describe('TaskSectionComponent', () => {
  let component: TaskSectionComponent;
  let fixture: ComponentFixture<TaskSectionComponent>;

  const mockTasks: Task[] = [
    generateTask({
      uuid: '3',
      title: 'Task 1',
      description: 'Description 1',
      priority: TaskPriority.HIGH,
      completed: false,
    }),
    generateTask({
      uuid: '4',
      title: 'Task 2',
      description: 'Description 2',
      priority: TaskPriority.LOW,
      completed: true,
    }),
    generateTask({
      uuid: '5',
      title: 'Task 3',
      description: 'Description 3',
      priority: TaskPriority.MEDIUM,
      completed: false,
    }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskSectionComponent],
      imports: [MatCardModule, MatButtonModule, MatIconModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskSectionComponent);
    component = fixture.componentInstance;
    component.tasks = mockTasks;
    component.title = 'Task Section';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title', () => {
    const titleElement = fixture.nativeElement.querySelector('.task-label');
    expect(titleElement.textContent).toBe('Task Section');
  });

  it('should display the correct number of tasks', () => {
    const taskCards = fixture.nativeElement.querySelectorAll('.tasks mat-card');
    expect(taskCards.length).toBe(mockTasks.length);
  });

  it('should emit completeTask when the complete button is clicked', () => {
    jest.spyOn(component.completeTask, 'emit');

    const completeButton = fixture.debugElement.query(
      By.css('[data-testid="complete-task"]'),
    );

    completeButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.completeTask.emit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should emit deleteTask when the delete button is clicked', () => {
    jest.spyOn(component.deleteTask, 'emit');

    const deleteButton = fixture.debugElement.query(
      By.css('[data-testid="delete-task"]'),
    );

    deleteButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.deleteTask.emit).toHaveBeenCalledWith(mockTasks[0]);
  });
});
