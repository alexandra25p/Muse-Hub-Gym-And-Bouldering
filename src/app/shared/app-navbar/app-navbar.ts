import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NzButtonModule, NzIconModule],
  templateUrl: './app-navbar.html',
  styleUrl: './app-navbar.scss',
})
export class AppNavbar {
  userName = input<string>('');
  logoutClick = output<void>();
}
