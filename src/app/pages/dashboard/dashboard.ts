import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AppNavbar } from '../../shared/app-navbar/app-navbar';
import { UserService } from '../../services/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [AppNavbar, NzCardModule, NzButtonModule, NzIconModule, NzTagModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private userService = inject(UserService);
  private router = inject(Router);

  user = this.userService.user;

  upcomingClasses = [
    { name: 'Morning Yoga', type: 'Yoga', day: 'Monday', time: '08:00', instructor: 'Ana Ionescu', color: 'purple' },
    { name: 'HIIT Blast', type: 'HIIT', day: 'Tuesday', time: '18:00', instructor: 'Mihai Pop', color: 'red' },
    { name: 'Boulder Basics', type: 'Bouldering', day: 'Wednesday', time: '17:00', instructor: 'Radu Stan', color: 'blue' },
  ];

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
