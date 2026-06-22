import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { AppNavbar } from '../../core/shared/app-navbar/app-navbar';
import { UserService } from '../../core/services/user.service';
import { WallService, WallRoute } from '../../core/services/wall.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-wall',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TitleCasePipe,
    AppNavbar,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTagModule,
  ],
  templateUrl: './wall.html',
  styleUrl: './wall.scss',
})
export class Wall {
  private userService = inject(UserService);
  private wallService = inject(WallService);
  private router = inject(Router);
  user = this.userService.user;
  isAdmin = computed(() => this.user()?.email === 'admin@muse.com');

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  searchQuery = signal('');
  gradeFilter = signal('');
  routes = this.wallService.routes;

  filteredRoutes = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const g = this.gradeFilter();
    return this.routes().filter(
      r =>
        (!g || r.grade === g) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.setter.toLowerCase().includes(q) ||
          r.grade.toLowerCase().includes(q))
    );
  });

  mySendsCount = computed(() => {
    const email = this.user()?.email;
    if (!email) return 0;
    return this.routes().filter(r => r.completedBy.includes(email)).length;
  });

  isCompleted(routeId: number): boolean {
    const email = this.user()?.email;
    return email
      ? (this.wallService.routes().find(r => r.id === routeId)?.completedBy.includes(email) ?? false)
      : false;
  }

  toggleComplete(routeId: number): void {
    const email = this.user()?.email;
    if (email) this.wallService.toggleComplete(routeId, email);
  }

  gradeOptions = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10+'];
  colorOptions = ['purple', 'blue', 'red', 'green', 'orange', 'yellow', 'white', 'black'];

  holdColors: Record<string, string> = {
    purple: '#9b7fd4',
    blue: '#5a9fd4',
    red: '#e05a5a',
    green: '#52c41a',
    orange: '#fa8c16',
    yellow: '#fadb14',
    white: '#d9d9d9',
    black: '#2d2d3e',
  };

  gradeColor(grade: string): string {
    const num = grade === 'V10+' ? 10 : parseInt(grade.substring(1));
    if (num <= 1) return 'success';
    if (num <= 3) return 'processing';
    if (num <= 5) return 'warning';
    if (num <= 7) return 'error';
    return 'purple';
  }

  gradeBorderHex(grade: string): string {
    const num = grade === 'V10+' ? 10 : parseInt(grade.substring(1));
    if (num <= 1) return '#52c41a';
    if (num <= 3) return '#5a9fd4';
    if (num <= 5) return '#fa8c16';
    if (num <= 7) return '#f5222d';
    return '#9b7fd4';
  }

  modalVisible = false;
  editingId: number | null = null;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      grade: ['', Validators.required],
      setter: ['', Validators.required],
      dateSet: ['', Validators.required],
      color: ['', Validators.required],
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form.reset();
    this.modalVisible = true;
  }

  openEdit(route: WallRoute): void {
    this.editingId = route.id;
    this.form.setValue({
      name: route.name,
      grade: route.grade,
      setter: route.setter,
      dateSet: route.dateSet,
      color: route.color,
    });
    this.modalVisible = true;
  }

  saveModal(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsDirty());
      return;
    }
    const val = this.form.value;
    if (this.editingId === null) {
      this.wallService.addRoute(val);
    } else {
      this.wallService.updateRoute(this.editingId, val);
    }
    this.modalVisible = false;
  }

  delete(id: number): void {
    this.wallService.deleteRoute(id);
  }
}
