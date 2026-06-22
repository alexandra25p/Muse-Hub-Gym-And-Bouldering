import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { passwordValidator, passwordsMatchValidator } from '../../core/helpers/validators';

interface SignupFormValues {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  city?: string;
  email?: string;
  phone?: string;
  bio?: string;
  password?: string;
  confirmPassword?: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignUp {
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  @ViewChild('photoInput') photoInput?: ElementRef<HTMLInputElement>;

  photoPreview = '';
  submitted = false;
  isLoading = false;
  errorMessage = '';

  form = new FormGroup(
    {
      profilePhoto: new FormControl(''),
      firstName: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      lastName: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      birthDate: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      city: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
      phone: new FormControl(''),
      bio: new FormControl(''),
      password: new FormControl('', { validators: [Validators.required, passwordValidator()], nonNullable: true }),
      confirmPassword: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    },
    { validators: passwordsMatchValidator }
  );

  pickPhoto(): void {
    this.photoInput?.nativeElement.click();
  }

  onPhotoSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 150; // Dimensiune mică pentru avatar
      const MAX_HEIGHT = 150;
      
      let width = img.width;
      let height = img.height;

      // Calculăm proporțiile
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // Transformăm în Base64, dar la calitate mai mică (0.7)
      this.photoPreview = canvas.toDataURL('image/jpeg', 0.7);
      
      console.log('Poza a fost micșorată! Acum are o dimensiune sigură pentru Firestore.');
    };
  };
  reader.readAsDataURL(file);
}

  async submit() {
    if (this.form.invalid || this.isLoading) return;
    this.submitted = true;
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const values = this.form.getRawValue() as SignupFormValues;
      
      const { confirmPassword, password, ...raw } = values;

      const userData = {
        name: `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim(),
        firstName: raw.firstName ?? '',
        lastName: raw.lastName ?? '',
        email: raw.email ?? '',
        birthDate: raw.birthDate ?? '',
        city: raw.city ?? '',
        phone: raw.phone ?? '',
        bio: raw.bio ?? '',
        profilePhoto: this.photoPreview ?? '',
        role: 'member',
        onboardingDone: false
      };

      const user = await this.authService.signUp(
        raw.email ?? '',
        password ?? '',
        userData as any 
      );

      console.log('Utilizator creat cu succes!', user);

      // Conectăm utilizatorul local în UserService
      this.userService.setUser({
        email: user.email,
        name: user.firstName || 'User',
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        city: user.city,
        profilePhoto: user.profilePhoto,
        phone: user.phone,
        bio: user.bio,
        role: 'member',
        onboardingDone: false
      }, true);

      this.isLoading = false;
      this.router.navigate(['/profile']);
    } catch (error: any) {
      this.isLoading = false;
      console.error('Eroare la înregistrare:', error);
      
      // Afișăm mesaje specifice de eroare în UI
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Acest e-mail este deja utilizat de un alt cont.';
      } else if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        this.errorMessage = 'Eroare de permisiune la scrierea în Firestore (users). Verificați regulile de securitate ale bazei de date în consola Firebase.';
      } else {
        this.errorMessage = error.message || 'Eroare la salvarea datelor în baza de date.';
      }
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
