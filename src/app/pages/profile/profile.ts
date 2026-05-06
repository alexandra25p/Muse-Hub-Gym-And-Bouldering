import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AppNavbar } from '../../shared/app-navbar/app-navbar';
import { UserService } from '../../services/user.service';

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
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private userService = inject(UserService);
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
