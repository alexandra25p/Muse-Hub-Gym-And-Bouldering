import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AppNavbar } from '../../shared/app-navbar/app-navbar';
import { UserService } from '../../services/user.service';
import { ClassesService } from '../../services/classes.service';
import { JournalService } from '../../services/journal.service';
import { WallService } from '../../services/wall.service';
import { BoulderingEntry } from '../../services/journal.service';

@Component({
  selector: 'app-dashboard',
  imports: [AppNavbar, NzCardModule, NzButtonModule, NzIconModule, NzTagModule, RouterLink],
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

  typeColors: Record<string, string> = {
    Yoga: 'purple',
    HIIT: 'red',
    Bouldering: 'blue',
    Strength: 'orange',
    Cardio: 'green',
    Pilates: 'pink',
    Stretching: 'cyan',
  };

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
