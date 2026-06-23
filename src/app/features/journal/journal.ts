import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppNavbar } from '../../core/shared/app-navbar/app-navbar';
import { AppChart } from '../../core/shared/chart/chart';
import { UserService } from '../../core/services/user.service';
import { JournalService, FitnessEntry, BoulderingEntry, JournalEntry } from '../../core/services/journal.service';
import { WallService } from '../../core/services/wall.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-journal',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AppNavbar,
    AppChart,
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
  private journalService = inject(JournalService);
  private wallService = inject(WallService);
  private router = inject(Router);
  user = this.userService.user;

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  entries = this.journalService.entries;
  activeTab = signal(0);

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
  wallSends = computed(() => {
    const email = this.user()?.email;
    if (!email) return 0;
    return this.wallService.routes().filter(r => r.completedBy.includes(email)).length;
  });

  // Chart data — chronological (oldest→newest), last 10 entries
  kcalLabels = computed(() =>
    this.entries().slice(0, 10).reverse().map(e => e.date)
  );
  kcalData = computed(() =>
    this.entries().slice(0, 10).reverse().map(e => e.kcal)
  );

  routesLabels = computed(() =>
    this.entries()
      .filter((e): e is BoulderingEntry => e.type === 'bouldering')
      .slice(0, 8).reverse().map(e => e.date)
  );
  routesData = computed(() =>
    this.entries()
      .filter((e): e is BoulderingEntry => e.type === 'bouldering')
      .slice(0, 8).reverse().map(e => e.routesFinished)
  );

  repsLabels = computed(() =>
    this.entries()
      .filter((e): e is FitnessEntry => e.type === 'fitness')
      .slice(0, 8).reverse().map(e => e.date)
  );
  repsData = computed(() =>
    this.entries()
      .filter((e): e is FitnessEntry => e.type === 'fitness')
      .slice(0, 8).reverse().map(e => e.reps)
  );

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
    const date = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (this.entryType() === 'fitness') {
      if (this.selectedMuscles.length === 0) this.muscleError = true;
      Object.values(this.fitnessForm.controls).forEach(c => c.markAsDirty());
      if (this.fitnessForm.invalid || this.selectedMuscles.length === 0) return;

      const v = this.fitnessForm.value;
      this.journalService.addEntry({
        type: 'fitness',
        date,
        muscleGroups: [...this.selectedMuscles],
        equipment: v.equipment,
        reps: v.reps,
        kcal: v.kcal,
      } as Omit<FitnessEntry, 'id'>);
    } else {
      Object.values(this.boulderingForm.controls).forEach(c => c.markAsDirty());
      if (this.boulderingForm.invalid) return;

      const v = this.boulderingForm.value;
      this.journalService.addEntry({
        type: 'bouldering',
        date,
        routesFinished: v.routesFinished,
        routesFlashed: v.routesFlashed,
        difficulty: v.difficulty,
        durationMinutes: v.durationMinutes,
        kcal: v.kcal,
      } as Omit<BoulderingEntry, 'id'>);
    }

    this.modalVisible = false;
  }

  isFitness(entry: JournalEntry): entry is FitnessEntry {
    return entry.type === 'fitness';
  }
}
