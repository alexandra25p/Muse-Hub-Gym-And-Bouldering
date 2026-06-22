import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DarkModeService } from '../../services/dark-mode.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NzButtonModule, NzIconModule],
  templateUrl: './app-navbar.html',
  styleUrl: './app-navbar.scss',
})
export class AppNavbar {
  userName = input<string>('');
  logoutClick = output<void>();

  darkMode = inject(DarkModeService);
  private userService = inject(UserService);

  isAdmin = computed(() => this.userService.user()?.email === 'admin@muse.com');
}
