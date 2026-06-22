import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';
import { EyeInvisibleOutline, EyeOutline } from '@ant-design/icons-angular/icons';

// Importăm serviciile necesare și helperul de validare
import { LoginModalService } from '../../services/login-modal.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { passwordValidator } from '../../helpers/validators';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzIconModule],
  providers: [{ provide: NZ_ICONS, useValue: [EyeOutline, EyeInvisibleOutline] }],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss',
})
export class LoginModal {
  private router = inject(Router);
  private modal = inject(LoginModalService);
  private userService = inject(UserService);
  private authService = inject(AuthService); // Serviciul nostru pentru Firebase

  visible = this.modal.visible;
  loginError = '';
  showPassword = false;

  form = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required, passwordValidator()], nonNullable: true }),
    rememberMe: new FormControl(false, { nonNullable: true }),
  });

  close(): void {
    this.modal.close();
    this.loginError = '';
    this.showPassword = false;
    this.form.reset(); 
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    const { email, password, rememberMe } = this.form.getRawValue();

    try {
      const user = await this.authService.login(
        (email ?? '').trim(), 
        password ?? ''
      );

      if (user) {
        this.userService.setUser({ 
          email: user.email, 
          name: user.firstName || 'User',
          firstName: user.firstName,
          lastName: user.lastName,
          city: user.city,
          birthDate: user.birthDate,
          phone: user.phone,
          bio: user.bio,
          profilePhoto: user.profilePhoto,
          role: user.role || 'member',
          status: user.status || 'active',
          onboardingDone: true 
        }, !!rememberMe);

        this.modal.close();
        this.router.navigate(['/dashboard']);
        this.form.reset();
        this.loginError = '';
        console.log('Logare reușită pentru:', user.email);
      }
    } catch (error: any) {
      console.error('Eroare la autentificare:', error.code);
      
      this.loginError = 'Invalid email or password.';
      
      if (error.code === 'auth/wrong-password') {
        console.warn('Parola introdusă este incorectă.');
      }
    }
  }
}