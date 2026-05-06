import { Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppNavbar } from '../../shared/app-navbar/app-navbar';
import { UserService } from '../../services/user.service';
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

export interface GymClass {
  id: number;
  name: string;
  type: string;
  instructor: string;
  day: string;
  time: string;
  capacity: number;
}

type SortKey = keyof GymClass;

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
  private router = inject(Router);
  user = this.userService.user;
  isAdmin = computed(() => this.user()?.email === 'admin@muse.com');

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  private nextId = signal(6);
  searchQuery = signal('');
  sortKey = signal<SortKey | null>(null);
  sortOrder = signal<NzTableSortOrder>(null);

  classes = signal<GymClass[]>([
    { id: 1, name: 'Morning Yoga', type: 'Yoga', instructor: 'Ana Ionescu', day: 'Monday', time: '08:00', capacity: 15 },
    { id: 2, name: 'HIIT Blast', type: 'HIIT', instructor: 'Mihai Pop', day: 'Tuesday', time: '18:00', capacity: 20 },
    { id: 3, name: 'Boulder Basics', type: 'Bouldering', instructor: 'Radu Stan', day: 'Wednesday', time: '17:00', capacity: 12 },
    { id: 4, name: 'Strength & Core', type: 'Strength', instructor: 'Elena Marin', day: 'Thursday', time: '19:00', capacity: 18 },
    { id: 5, name: 'Weekend Climb', type: 'Bouldering', instructor: 'Radu Stan', day: 'Saturday', time: '10:00', capacity: 10 },
  ]);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    let list = this.classes().filter(
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
    const val = this.form.value as Omit<GymClass, 'id'>;
    if (this.editingId === null) {
      const id = this.nextId();
      this.classes.update(list => [...list, { id, ...val }]);
      this.nextId.update(n => n + 1);
    } else {
      this.classes.update(list =>
        list.map(c => (c.id === this.editingId ? { id: c.id, ...val } : c))
      );
    }
    this.modalVisible = false;
  }

  delete(id: number): void {
    this.classes.update(list => list.filter(c => c.id !== id));
  }

  onSortChange(key: SortKey, order: NzTableSortOrder): void {
    this.sortKey.set(order ? key : null);
    this.sortOrder.set(order);
  }
}
