import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppNavbar } from '../../core/shared/app-navbar/app-navbar';
import { UserService } from '../../core/services/user.service';
import { ClassesService, GymClass } from '../../core/services/classes.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

type SortKey = 'id' | 'name' | 'type' | 'instructor' | 'day' | 'time' | 'capacity';

@Component({
  selector: 'app-classes',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AppNavbar,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzModalModule,
    NzSelectModule,
    NzIconModule,
    NzTagModule,
    NzPopconfirmModule,
    NzInputNumberModule,
  ],
  templateUrl: './classes.html',
  styleUrl: './classes.scss',
})
export class Classes {
  private userService = inject(UserService);
  private classesService = inject(ClassesService);
  private router = inject(Router);
  user = this.userService.user;
  isAdmin = computed(() => this.user()?.email === 'admin@muse.com');

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  searchQuery = signal('');
  sortKey = signal<SortKey | null>(null);
  sortOrder = signal<NzTableSortOrder>(null);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    let list = this.classesService.classes().filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.day.toLowerCase().includes(q)
    );
    const key = this.sortKey();
    const order = this.sortOrder();
    if (key && order) {
      list = [...list].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
        return order === 'ascend' ? cmp : -cmp;
      });
    }
    return list;
  });

  modalVisible = false;
  editingId: number | null = null;
  form: FormGroup;

  typeOptions = ['Yoga', 'HIIT', 'Bouldering', 'Strength', 'Cardio', 'Pilates', 'Stretching'];
  dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  typeColors: Record<string, string> = {
    Yoga: 'purple',
    HIIT: 'red',
    Bouldering: 'blue',
    Strength: 'orange',
    Cardio: 'green',
    Pilates: 'pink',
    Stretching: 'cyan',
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      instructor: ['', Validators.required],
      day: ['', Validators.required],
      time: ['', Validators.required],
      capacity: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form.reset();
    this.modalVisible = true;
  }

  openEdit(cls: GymClass): void {
    this.editingId = cls.id;
    this.form.setValue({
      name: cls.name,
      type: cls.type,
      instructor: cls.instructor,
      day: cls.day,
      time: cls.time,
      capacity: cls.capacity,
    });
    this.modalVisible = true;
  }

  saveModal(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsDirty());
      return;
    }
    const val = this.form.value as Omit<GymClass, 'id' | 'enrolled' | 'attended'>;
    if (this.editingId === null) {
      this.classesService.addClass(val);
    } else {
      this.classesService.updateClass(this.editingId, val);
    }
    this.modalVisible = false;
  }

  delete(id: number): void {
    this.classesService.deleteClass(id);
  }

  toggleBooking(classId: number): void {
    const email = this.user()?.email;
    if (email) this.classesService.toggleBooking(classId, email);
  }

  isBooked(classId: number): boolean {
    const email = this.user()?.email;
    return email ? this.classesService.isBooked(classId, email) : false;
  }

  isFull(classId: number): boolean {
    return this.classesService.isFull(classId);
  }

  onSortChange(key: SortKey, order: NzTableSortOrder): void {
    this.sortKey.set(order ? key : null);
    this.sortOrder.set(order);
  }
}
