import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';
import { EyeInvisibleOutline, EyeOutline } from '@ant-design/icons-angular/icons';
import { LoginModalService } from '../../services/login-modal.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzIconModule],
  providers: [{ provide: NZ_ICONS, useValue: [EyeOutline, EyeInvisibleOutline] }],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss',
})
export class LoginModal {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private modal = inject(LoginModalService);
  private userService = inject(UserService);

  visible = this.modal.visible;
  loginError = '';
  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  close(): void {
    this.modal.close();
    this.loginError = '';
    this.showPassword = false;
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => control.markAsDirty());
      return;
    }

    const { email, password, rememberMe } = this.form.getRawValue();

    if (email === 'admin@muse.com' && password === 'Password1!') {
      this.userService.setUser({ email, name: 'Admin', onboardingDone: true }, !!rememberMe);
      this.modal.close();
      this.router.navigate(['/dashboard']);
      this.form.reset({ email: '', password: '', rememberMe: false });
      this.loginError = '';
      return;
    }

    this.loginError = 'Invalid email or password.';
  }
}
