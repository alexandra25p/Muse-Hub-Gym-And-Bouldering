import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

const passwordPattern = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class SignUp {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  @ViewChild('photoInput') photoInput?: ElementRef<HTMLInputElement>;

  photoPreview = '';
  submitted = false;
  isLoading = false;
  errorMessage = '';

  form = this.fb.group(
    {
      profilePhoto: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      city: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: [''],
      password: ['', [Validators.required, Validators.pattern(passwordPattern)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator }
  );

  pickPhoto(): void {
    this.photoInput?.nativeElement.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = String(reader.result ?? '');
      this.form.patchValue({ profilePhoto: this.photoPreview });
    };
    reader.readAsDataURL(file);
  }

  async submit(): Promise<void> {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { confirmPassword, password, ...raw } = this.form.getRawValue();

      const name = `${raw.firstName} ${raw.lastName}`.trim();
      
      // Call AuthService to handle Firebase registration
      const user = await this.authService.signUp(
        raw.email ?? '',
        password ?? '',
        {
          email: raw.email ?? '',
          name,
          firstName: raw.firstName ?? undefined,
          lastName: raw.lastName ?? undefined,
          birthDate: raw.birthDate ?? undefined,
          city: raw.city ?? undefined,
          profilePhoto: raw.profilePhoto || '',
          bio: raw.bio || '',
          phone: raw.phone || '',
          onboardingDone: false,
        }
      );

      // Also update local user state
      this.userService.setUser(user, true);

      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error?.message || 'Registration failed. Please try again.';
      console.error('SignUp error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  showPasswordMismatch(): boolean {
    const confirmPassword = this.form.get('confirmPassword');
    return !!confirmPassword && (confirmPassword.touched || this.submitted) && this.form.hasError('passwordsMismatch');
  }
}
