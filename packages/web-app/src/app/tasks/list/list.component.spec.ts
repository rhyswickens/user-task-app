import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { Task, generateTask } from '@take-home/shared';
import { Observable, of } from 'rxjs';
import { ListComponent } from './list.component';
import { TasksService } from '../tasks.service';
import { MatCardModule } from '@angular/material/card';
import { FiltersComponent } from '../filters/filters.component';
import { SearchComponent } from '../search/search.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../storage/storage.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TaskSectionComponent } from '../task-section/task-section.component';

const fakeTasks: Task[] = [
  generateTask({ uuid: '3', completed: false }),
  generateTask({ uuid: '4', completed: false }),
];

class MockTasksService {
  tasks: Task[] = fakeTasks;
  getTasksFromApi(): Observable<Task[]> {
    return of(fakeTasks);
  }
  getTasksFromStorage(): Promise<Task[]> {
    return Promise.resolve(fakeTasks);
  }
  filterTask(): void {
    return;
  }

  markTaskAsComplete(task: Task): void {
    task.completed = true;
  }

  deleteTask(task: Task): void {
    task.isArchived = true;
  }
}

class MockStorageService {
  getTasks(): Promise<Task[]> {
    return Promise.resolve(fakeTasks);
  }
  updateTaskItem(): void {
    return;
  }
}

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  let loader: HarnessLoader;
  let component: ListComponent;
  let tasksService: TasksService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
      ],
      declarations: [
        ListComponent,
        FiltersComponent,
        SearchComponent,
        TaskSectionComponent,
      ],
      providers: [
        { provide: TasksService, useClass: MockTasksService },
        { provide: StorageService, useClass: MockStorageService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    tasksService = TestBed.inject(TasksService);
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    tasksService.tasks = [...fakeTasks];
    fakeTasks.forEach((task) => {
      task.completed = false;
      task.isArchived = false;
    });
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('My Daily Tasks');
  });

  it(`should display total number of tasks`, () => {
    const total = fixture.debugElement.query(By.css('h3'));
    expect(total.nativeElement.textContent).toEqual(
      `Total Tasks: ${fakeTasks.length}`,
    );
  });

  it(`should display the number of tasks to complete`, () => {
    const incompleteTasks = fakeTasks.filter((task) => !task.completed);
    const incomplete = fixture.debugElement.queryAll(By.css('h3'))[1];
    expect(incomplete.nativeElement.textContent).toEqual(
      `Tasks to Complete: ${incompleteTasks.length}`,
    );
  });

  it(`should display the number of completed tasks`, () => {
    const completedTasks = fakeTasks.filter((task) => task.completed);
    const completed = fixture.debugElement.queryAll(By.css('h3'))[2];
    expect(completed.nativeElement.textContent).toEqual(
      `Completed Tasks: ${completedTasks.length}`,
    );
  });

  it(`should display list of tasks as mat-cards`, () => {
    const taskLists = fixture.debugElement.queryAll(
      By.css('take-home-task-section'),
    );
    expect(taskLists.length).toBe(2);

    const incompleteTasksSection = taskLists[0].componentInstance.tasks;
    const completedTasksSection = taskLists[1].componentInstance.tasks;

    expect(incompleteTasksSection.length).toEqual(
      fakeTasks.filter((task) => !task.completed).length,
    );
    expect(completedTasksSection.length).toEqual(
      fakeTasks.filter((task) => task.completed).length,
    );
  });

  it(`should navigate to /add when add button is clicked`, async () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    await addButton.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/add']);
  });

  it(`should mark a task as complete when done button is clicked`, async () => {
    jest.spyOn(component, 'onDoneTask');

    const completeButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="complete-task"]' }),
    );

    expect(completeButton).toBeTruthy();

    await completeButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.onDoneTask).toHaveBeenCalledTimes(1);
  });

  it(`should mark a task as archived when delete button is clicked`, async () => {
    jest.spyOn(component, 'onDeleteTask');

    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );

    expect(deleteButton).toBeTruthy();

    await deleteButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.onDeleteTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].isArchived).toBe(true);
  });

  it('should not display archived tasks after deleting them', async () => {
    expect(
      fixture.nativeElement.querySelectorAll('.tasks mat-card').length,
    ).toBe(2);

    jest.spyOn(component, 'onDeleteTask');
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({
        selector: `[data-testid="delete-task"]`,
      }),
    );
    await deleteButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.onDeleteTask).toHaveBeenCalled();

    setTimeout(() => {
      const visibleTasks =
        fixture.nativeElement.querySelectorAll('.tasks mat-card');
      console.log('visible tasks', visibleTasks);
      expect(visibleTasks.length).toBe(1);
      expect(visibleTasks[0].textContent).toContain('Task 1');
      expect(visibleTasks[0].textContent).not.toContain('Task 2');
    }, 0);
  });
});
