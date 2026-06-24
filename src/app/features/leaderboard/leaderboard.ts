import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AppNavbar } from '../../core/shared/app-navbar/app-navbar';
import { UserService } from '../../core/services/user.service';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

interface LeaderMember {
  name: string;
  initials: string;
  kcal: number;
  flashed: number;
  streak: number;
}

type SortKey = 'kcal' | 'flashed' | 'streak';

@Component({
  selector: 'app-leaderboard',
  imports: [AppNavbar, NzAvatarModule, NzIconModule, NzTagModule, DecimalPipe],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss',
})
export class Leaderboard implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  user = this.userService.user;
  sortBy = signal<SortKey>('kcal');
  leaderMembers = signal<LeaderMember[]>([]);

  sorted = computed(() => {
    const key = this.sortBy();
    return [...this.leaderMembers()].sort((a, b) => b[key] - a[key]);
  });

  podium = computed(() => {
    const s = this.sorted();
    // Fallback în caz că sunt mai puțin de 3 membri în baza de date
    const first = s[0] || { name: '-', initials: '-', kcal: 0, flashed: 0, streak: 0 };
    const second = s[1] || { name: '-', initials: '-', kcal: 0, flashed: 0, streak: 0 };
    const third = s[2] || { name: '-', initials: '-', kcal: 0, flashed: 0, streak: 0 };
    return [second, first, third];
  });

  tableRows = computed(() => this.sorted().slice(3));

  async ngOnInit() {
    await this.loadLeaderboardData();
  }

  async loadLeaderboardData(): Promise<void> {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const workoutsSnap = await getDocs(collection(db, 'workouts'));

      // Agregăm antrenamentele per email utilizator
      const workoutStats = new Map<string, { kcal: number; flashed: number; dates: string[] }>();
      
      workoutsSnap.forEach(docSnap => {
        const data = docSnap.data();
        const email = data['userEmail'];
        if (!email) return;

        const kcal = Number(data['kcal'] || 0);
        const flashed = Number(data['routesFlashed'] || 0);
        const date = data['date'] || '';

        const current = workoutStats.get(email) || { kcal: 0, flashed: 0, dates: [] };
        current.kcal += kcal;
        current.flashed += flashed;
        if (date) {
          current.dates.push(date);
        }
        workoutStats.set(email, current);
      });

      // Construim clasamentul din utilizatorii reali din Firestore
      const list: LeaderMember[] = [];
      
      usersSnap.forEach(docSnap => {
        const data = docSnap.data();
        const email = data['email'] || '';
        const role = data['role'] || 'member';

        // Excludem administratorul din clasamentul membrilor
        if (role === 'admin' || email === 'admin@muse.com') return;

        const firstName = data['firstName'] || '';
        const lastName = data['lastName'] || '';
        const name = data['name'] || `${firstName} ${lastName}`.trim() || 'User';
        const initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || name.substring(0, 2).toUpperCase() || 'U';

        const stats = workoutStats.get(email) || { kcal: 0, flashed: 0, dates: [] };
        const streak = this.calculateStreak(stats.dates);

        list.push({
          name,
          initials,
          kcal: stats.kcal,
          flashed: stats.flashed,
          streak: streak
        });
      });

      this.leaderMembers.set(list);
    } catch (err) {
      console.error('Error loading leaderboard data:', err);
    }
  }

  private calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;

    // Obținem doar partea de dată YYYY-MM-DD
    const uniqueDates = [...new Set(dates.map(d => {
      // Dacă data e în format românesc sau alt format text, încercăm să obținem o dată validă
      const parsed = Date.parse(d);
      if (!isNaN(parsed)) {
        return new Date(parsed).toISOString().split('T')[0];
      }
      return d.split(' ')[0] || d;
    }))].sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of uniqueDates) {
      const currentDate = new Date(dateStr);
      if (isNaN(currentDate.getTime())) continue;

      if (!prevDate) {
        currentStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }
          currentStreak = 1;
        }
      }
      prevDate = currentDate;
    }

    return Math.max(maxStreak, currentStreak);
  }

  rankOf(member: LeaderMember): number {
    return this.sorted().indexOf(member) + 1;
  }

  medalColor(rank: number): string {
    if (rank === 1) return '#faad14';
    if (rank === 2) return '#8c8c8c';
    if (rank === 3) return '#d46b08';
    return '';
  }

  sortLabels: Record<SortKey, string> = {
    kcal: 'Kcal Burned',
    flashed: 'Routes Flashed',
    streak: 'Day Streak',
  };

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
