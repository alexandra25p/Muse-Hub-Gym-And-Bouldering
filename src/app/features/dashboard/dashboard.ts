import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FormsModule } from '@angular/forms';
import { AppNavbar } from '../../core/shared/app-navbar/app-navbar';
import { UserService } from '../../core/services/user.service';
import { ClassesService } from '../../core/services/classes.service';
import { JournalService, BoulderingEntry } from '../../core/services/journal.service';
import { WallService } from '../../core/services/wall.service';

@Component({
  selector: 'app-dashboard',
  imports: [AppNavbar, NzCardModule, NzButtonModule, NzIconModule, NzTagModule, NzModalModule, NzRadioModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private userService = inject(UserService);
  private classesService = inject(ClassesService);
  private journalService = inject(JournalService);
  private wallService = inject(WallService);
  private router = inject(Router);

  user = this.userService.user;
  isAdmin = computed(() => this.user()?.email === 'admin@muse.com');

  showOnboarding = computed(() => {
    const u = this.user();
    return u !== null && u.onboardingDone === false;
  });

  onboardingStep = signal(1);
  selectedGoal = signal('');
  selectedLevel = signal('');

  fitnessGoals = ['Strength', 'Cardio', 'Bouldering', 'Flexibility', 'Weight Loss'];
  experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];

  nextOnboardingStep(): void {
    if (!this.selectedGoal()) return;
    this.onboardingStep.set(2);
  }

  completeOnboarding(): void {
    if (!this.selectedLevel()) return;
    this.userService.completeOnboarding(this.selectedGoal(), this.selectedLevel());
  }

  myBookings = computed(() => {
    const email = this.user()?.email;
    if (!email) return [];
    return this.classesService.classes().filter(c => c.enrolled.includes(email));
  });

  upcomingClasses = computed(() => this.classesService.classes().slice(0, 3));

  journalCount = computed(() => this.journalService.entries().length);
  wallSends = computed(() => {
    const email = this.user()?.email;
    if (!email) return 0;
    return this.wallService.routes().filter(r => r.completedBy.includes(email)).length;
  });
  totalRoutes = computed(() =>
    this.journalService
      .entries()
      .filter((e): e is BoulderingEntry => e.type === 'bouldering')
      .reduce((sum, e) => sum + e.routesFinished, 0) + this.wallSends()
  );

  recentActivity = computed(() => this.journalService.entries().slice(0, 5));

  typeColors: Record<string, string> = {
    Yoga: 'purple',
    HIIT: 'red',
    Bouldering: 'blue',
    Strength: 'orange',
    Cardio: 'green',
    Pilates: 'pink',
    Stretching: 'cyan',
  };

  activitySummary(entry: ReturnType<typeof this.journalService.entries>[0]): string {
    if (entry.type === 'fitness') {
      return `${(entry as any).equipment} · ${(entry as any).reps} reps · ${entry.kcal} kcal`;
    }
    return `${(entry as any).routesFinished} routes · ${(entry as any).routesFlashed} flashed · ${entry.kcal} kcal`;
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
