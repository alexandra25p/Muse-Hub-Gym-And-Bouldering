import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzAlertModule,
    NzCheckboxModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  loginForm: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach((control) => control.markAsDirty());
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    // Replace this with a real API call
    setTimeout(() => {
      if (email === 'admin@muse.com' && password === 'password') {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          sessionStorage.removeItem('rememberedEmail');
        } else {
          sessionStorage.setItem('rememberedEmail', email);
          localStorage.removeItem('rememberedEmail');
        }

        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Invalid email or password.';
      }
      this.loading = false;
    }, 800);
  }
}
