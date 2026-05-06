import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppNavbar } from '../../shared/app-navbar/app-navbar';
import { UserService } from '../../services/user.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';

export interface FitnessEntry {
  id: number;
  type: 'fitness';
  date: string;
  muscleGroups: string[];
  equipment: string;
  reps: number;
  kcal: number;
}

export interface BoulderingEntry {
  id: number;
  type: 'bouldering';
  date: string;
  routesFinished: number;
  routesFlashed: number;
  difficulty: string;
  durationMinutes: number;
  kcal: number;
}

export type JournalEntry = FitnessEntry | BoulderingEntry;

@Component({
  selector: 'app-journal',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AppNavbar,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTagModule,
  ],
  templateUrl: './journal.html',
  styleUrl: './journal.scss',
})
export class Journal {
  private userService = inject(UserService);
  private router = inject(Router);
  user = this.userService.user;

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  private nextId = signal(1);
  activeTab = signal(0);
  entries = signal<JournalEntry[]>([]);

  filteredEntries = computed(() => {
    const tab = this.activeTab();
    const all = this.entries();
    if (tab === 1) return all.filter(e => e.type === 'fitness');
    if (tab === 2) return all.filter(e => e.type === 'bouldering');
    return all;
  });

  totalFitness = computed(() => this.entries().filter(e => e.type === 'fitness').length);
  totalRoutes = computed(() =>
    this.entries()
      .filter((e): e is BoulderingEntry => e.type === 'bouldering')
      .reduce((sum, e) => sum + e.routesFinished, 0)
  );
  totalFlashed = computed(() =>
    this.entries()
      .filter((e): e is BoulderingEntry => e.type === 'bouldering')
      .reduce((sum, e) => sum + e.routesFlashed, 0)
  );
  totalKcal = computed(() => this.entries().reduce((sum, e) => sum + e.kcal, 0));

  modalVisible = false;
  entryType = signal<'fitness' | 'bouldering'>('fitness');
  selectedMuscles: string[] = [];
  muscleError = false;

  muscleOptions = ['Arms', 'Glutes', 'Shoulders'];
  difficultyOptions = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10+'];

  fitnessForm: FormGroup;
  boulderingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.fitnessForm = this.fb.group({
      equipment: ['', Validators.required],
      reps: [null, [Validators.required, Validators.min(1)]],
      kcal: [null, [Validators.required, Validators.min(0)]],
    });

    this.boulderingForm = this.fb.group({
      routesFinished: [null, [Validators.required, Validators.min(0)]],
      routesFlashed: [null, [Validators.required, Validators.min(0)]],
      difficulty: ['', Validators.required],
      durationMinutes: [null, [Validators.required, Validators.min(1)]],
      kcal: [null, [Validators.required, Validators.min(0)]],
    });
  }

  openAdd(): void {
    this.fitnessForm.reset();
    this.boulderingForm.reset();
    this.selectedMuscles = [];
    this.muscleError = false;
    this.entryType.set('fitness');
    this.modalVisible = true;
  }

  toggleMuscle(muscle: string, checked: boolean): void {
    this.selectedMuscles = checked
      ? [...this.selectedMuscles, muscle]
      : this.selectedMuscles.filter(m => m !== muscle);
    this.muscleError = false;
  }

  save(): void {
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    if (this.entryType() === 'fitness') {
      if (this.selectedMuscles.length === 0) this.muscleError = true;
      Object.values(this.fitnessForm.controls).forEach(c => c.markAsDirty());
      if (this.fitnessForm.invalid || this.selectedMuscles.length === 0) return;

      const v = this.fitnessForm.value;
      this.entries.update(list => [
        {
          id: this.nextId(),
          type: 'fitness',
          date,
          muscleGroups: [...this.selectedMuscles],
          equipment: v.equipment,
          reps: v.reps,
          kcal: v.kcal,
        },
        ...list,
      ]);
    } else {
      Object.values(this.boulderingForm.controls).forEach(c => c.markAsDirty());
      if (this.boulderingForm.invalid) return;

      const v = this.boulderingForm.value;
      this.entries.update(list => [
        {
          id: this.nextId(),
          type: 'bouldering',
          date,
          routesFinished: v.routesFinished,
          routesFlashed: v.routesFlashed,
          difficulty: v.difficulty,
          durationMinutes: v.durationMinutes,
          kcal: v.kcal,
        },
        ...list,
      ]);
    }

    this.nextId.update(n => n + 1);
    this.modalVisible = false;
  }

  isFitness(entry: JournalEntry): entry is FitnessEntry {
    return entry.type === 'fitness';
  }
}
