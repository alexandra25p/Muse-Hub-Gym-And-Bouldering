import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AppNavbar } from '../../core/shared/app-navbar/app-navbar';
import { UserService } from '../../core/services/user.service';
import { JournalService, BoulderingEntry, FitnessEntry } from '../../core/services/journal.service';
import { WallService } from '../../core/services/wall.service';

interface Badge {
  id: string;
  label: string;
  desc: string;
  icon: string;
  earned: boolean;
  color: string;
}

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    AppNavbar,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAvatarModule,
    NzTagModule,
    NzIconModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private userService = inject(UserService);
  private journalService = inject(JournalService);
  private wallService = inject(WallService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  user = this.userService.user;
  editing = signal(false);
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [this.user()?.name ?? '', Validators.required],
    });
  }

  get initials(): string {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  achievements = computed((): Badge[] => {
    const entries = this.journalService.entries();
    const bouldering = entries.filter((e): e is BoulderingEntry => e.type === 'bouldering');
    const fitness = entries.filter((e): e is FitnessEntry => e.type === 'fitness');
    const totalKcal = entries.reduce((s, e) => s + e.kcal, 0);
    const totalFlashed = bouldering.reduce((s, e) => s + e.routesFlashed, 0);
    const email = this.user()?.email ?? '';
    const wallSends = this.wallService.routes().filter(r => r.completedBy.includes(email)).length;

    return [
      { id: 'first_entry',   label: 'First Step',     desc: 'Log your first journal entry',         icon: 'edit',         earned: entries.length >= 1,       color: '#9b7fd4' },
      { id: 'first_flash',   label: 'First Flash',    desc: 'Flash your first bouldering route',    icon: 'star',         earned: totalFlashed >= 1,         color: '#fadb14' },
      { id: 'fitness_fan',   label: 'Fitness Fan',    desc: 'Log 5 fitness sessions',               icon: 'fire',         earned: fitness.length >= 5,       color: '#fa8c16' },
      { id: 'boulder_baby',  label: 'Boulder Baby',   desc: 'Complete a bouldering session',        icon: 'apartment',    earned: bouldering.length >= 1,    color: '#5a9fd4' },
      { id: 'v5_crusher',    label: 'V5 Crusher',     desc: 'Boulder at V5 or harder',              icon: 'trophy',       earned: bouldering.some(e => ['V5','V6','V7','V8','V9','V10+'].includes(e.difficulty)), color: '#ff4d4f' },
      { id: 'calorie_king',  label: 'Calorie King',   desc: 'Burn 5 000 total kcal',                icon: 'thunderbolt',  earned: totalKcal >= 5000,         color: '#eb2f96' },
      { id: 'flash_master',  label: 'Flash Master',   desc: 'Flash 10 routes across all sessions',  icon: 'crown',        earned: totalFlashed >= 10,        color: '#faad14' },
      { id: 'wall_hero',     label: 'Wall Hero',      desc: 'Send 5 wall routes',                   icon: 'check-circle', earned: wallSends >= 5,            color: '#52c41a' },
    ];
  });

  startEdit(): void {
    this.form.setValue({ name: this.user()?.name ?? '' });
    this.editing.set(true);
  }

  saveEdit(): void {
    if (this.form.invalid) return;
    this.userService.updateName(this.form.value.name);
    this.editing.set(false);
    this.message.success('Profile updated!');
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
