import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    const ok =
      value.length >= 6 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value) &&
      /[^A-Za-z0-9]/.test(value);
    return ok ? null : { passwordStrength: true };
  };
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzAlertModule,
    NzCheckboxModule,
    NzTabsModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  loginForm: FormGroup;
  signupForm: FormGroup;
  activeTab = 0;
  showLoginPassword = false;
  showSignupPassword = false;
  showConfirmPassword = false;
  loginLoading = false;
  signupLoading = false;
  loginError = '';
  signupError = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.signupForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatchValidator }
    );
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(c => c.markAsDirty());
      return;
    }
    this.loginLoading = true;
    this.loginError = '';
    const { email, password, rememberMe } = this.loginForm.value;

    setTimeout(() => {
      if (email === 'admin@muse.com' && password === 'Password1!') {
        const user = { email, name: 'Admin' };
        rememberMe
          ? localStorage.setItem('user', JSON.stringify(user))
          : sessionStorage.setItem('user', JSON.stringify(user));
        this.router.navigate(['/dashboard']);
      } else {
        this.loginError = 'Invalid email or password.';
      }
      this.loginLoading = false;
    }, 800);
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      Object.values(this.signupForm.controls).forEach(c => c.markAsDirty());
      return;
    }
    this.signupLoading = true;
    this.signupError = '';
    const { firstName, lastName, email } = this.signupForm.value;

    setTimeout(() => {
      const user = { email, name: `${firstName} ${lastName}` };
      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigate(['/dashboard']);
      this.signupLoading = false;
    }, 800);
  }

  get passwordMismatch(): boolean {
    return !!(
      this.signupForm.hasError('passwordsMismatch') &&
      this.signupForm.get('confirmPassword')?.dirty
    );
  }
}
