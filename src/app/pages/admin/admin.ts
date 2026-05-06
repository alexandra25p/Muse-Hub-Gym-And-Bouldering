import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';
import { AppNavbar } from '../../shared/app-navbar/app-navbar';
import { UserService } from '../../services/user.service';
import { ClassesService } from '../../services/classes.service';

interface MockMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  joinDate: string;
  initials: string;
}

const MOCK_MEMBERS: MockMember[] = [
  { id: 1, name: 'Admin',           email: 'admin@muse.com',              role: 'admin',  status: 'active',   joinDate: '2024-01-01', initials: 'AD' },
  { id: 2, name: 'Ioana Constantin',email: 'ioana.c@example.com',         role: 'member', status: 'active',   joinDate: '2024-02-10', initials: 'IC' },
  { id: 3, name: 'Radu Stan',       email: 'radu.stan@example.com',       role: 'member', status: 'active',   joinDate: '2024-02-18', initials: 'RS' },
  { id: 4, name: 'Sorina Tudor',    email: 'sorina.tudor@example.com',    role: 'member', status: 'active',   joinDate: '2024-03-05', initials: 'ST' },
  { id: 5, name: 'Ana Ionescu',     email: 'ana.ionescu@example.com',     role: 'member', status: 'active',   joinDate: '2024-03-12', initials: 'AI' },
  { id: 6, name: 'Maria Popa',      email: 'maria.popa@example.com',      role: 'member', status: 'active',   joinDate: '2024-03-20', initials: 'MP' },
  { id: 7, name: 'Elena Marin',     email: 'elena.marin@example.com',     role: 'member', status: 'active',   joinDate: '2024-04-02', initials: 'EM' },
  { id: 8, name: 'Bogdan Nica',     email: 'bogdan.nica@example.com',     role: 'member', status: 'active',   joinDate: '2024-04-14', initials: 'BN' },
  { id: 9, name: 'Mihai Pop',       email: 'mihai.pop@example.com',       role: 'member', status: 'inactive', joinDate: '2024-04-22', initials: 'MP' },
  { id: 10, name: 'Andrei Gheorghe',email: 'andrei.g@example.com',        role: 'member', status: 'active',   joinDate: '2024-05-01', initials: 'AG' },
  { id: 11, name: 'Cristian Dima',  email: 'cristian.dima@example.com',   role: 'member', status: 'inactive', joinDate: '2024-05-08', initials: 'CD' },
];

@Component({
  selector: 'app-admin',
  imports: [AppNavbar, NzTableModule, NzButtonModule, NzTagModule, NzIconModule, NzAvatarModule, NzSwitchModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private userService = inject(UserService);
  private classesService = inject(ClassesService);
  private router = inject(Router);

  user = this.userService.user;
  members = signal([...MOCK_MEMBERS]);
  classes = this.classesService.classes;
  expandedClass = signal<number | null>(null);

  activeCount = computed(() => this.members().filter(m => m.status === 'active').length);
  memberCount  = computed(() => this.members().filter(m => m.role === 'member').length);

  isAttended(classId: number, email: string): boolean {
    return this.classesService.isAttended(classId, email);
  }

  toggleAttendance(classId: number, email: string, present: boolean): void {
    this.classesService.markAttendance(classId, email, present);
  }

  toggleExpand(classId: number): void {
    this.expandedClass.update(cur => (cur === classId ? null : classId));
  }

  toggleStatus(memberId: number): void {
    this.members.update(list =>
      list.map(m =>
        m.id === memberId
          ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
          : m
      )
    );
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
