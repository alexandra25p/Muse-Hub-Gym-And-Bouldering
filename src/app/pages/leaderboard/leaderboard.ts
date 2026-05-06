import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AppNavbar } from '../../shared/app-navbar/app-navbar';
import { UserService } from '../../services/user.service';

interface LeaderMember {
  name: string;
  initials: string;
  kcal: number;
  flashed: number;
  streak: number;
}

const MOCK_MEMBERS: LeaderMember[] = [
  { name: 'Ioana Constantin', initials: 'IC', kcal: 16800, flashed: 51, streak: 25 },
  { name: 'Radu Stan',        initials: 'RS', kcal: 15600, flashed: 42, streak: 21 },
  { name: 'Sorina Tudor',     initials: 'ST', kcal: 14200, flashed: 44, streak: 19 },
  { name: 'Ana Ionescu',      initials: 'AI', kcal: 12400, flashed: 27, streak: 14 },
  { name: 'Maria Popa',       initials: 'MP', kcal: 13900, flashed: 38, streak: 17 },
  { name: 'Elena Marin',      initials: 'EM', kcal: 11200, flashed: 33, streak: 11 },
  { name: 'Bogdan Nica',      initials: 'BN', kcal: 10500, flashed: 24, streak: 9  },
  { name: 'Mihai Pop',        initials: 'MP', kcal: 9800,  flashed: 19, streak: 8  },
  { name: 'Andrei Gheorghe',  initials: 'AG', kcal: 8700,  flashed: 15, streak: 6  },
  { name: 'Cristian Dima',    initials: 'CD', kcal: 7200,  flashed: 11, streak: 4  },
];

type SortKey = 'kcal' | 'flashed' | 'streak';

@Component({
  selector: 'app-leaderboard',
  imports: [AppNavbar, NzAvatarModule, NzIconModule, NzTagModule, DecimalPipe],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss',
})
export class Leaderboard {
  private userService = inject(UserService);
  private router = inject(Router);

  user = this.userService.user;
  sortBy = signal<SortKey>('kcal');

  sorted = computed(() => {
    const key = this.sortBy();
    return [...MOCK_MEMBERS].sort((a, b) => b[key] - a[key]);
  });

  podium = computed(() => {
    const s = this.sorted();
    return [s[1], s[0], s[2]]; // 2nd, 1st, 3rd for visual podium order
  });

  tableRows = computed(() => this.sorted().slice(3));

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
    this.router.navigate(['/login']);
  }
}
