import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzModalModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzAlertModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  authModalVisible = false;
  activeTab = 0;
  showLoginPassword = false;
  showSignupPassword = false;
  loginLoading = false;
  signupLoading = false;
  loginError = '';
  signupError = '';

  loginForm: FormGroup;
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  openAuth(tab: 'login' | 'signup'): void {
    this.activeTab = tab === 'login' ? 0 : 1;
    this.authModalVisible = true;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(c => c.markAsDirty());
      return;
    }
    this.loginLoading = true;
    this.loginError = '';
    const { email, password } = this.loginForm.value;

    // Replace with real API call
    setTimeout(() => {
      if (email === 'admin@muse.com' && password === 'password') {
        localStorage.setItem('user', JSON.stringify({ email }));
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
    const { name, email } = this.signupForm.value;

    // Replace with real API call
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ name, email }));
      this.router.navigate(['/dashboard']);
      this.signupLoading = false;
    }, 800);
  }
}
