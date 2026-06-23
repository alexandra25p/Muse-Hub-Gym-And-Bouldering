import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LoginModalService } from '../../core/services/login-modal.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NzButtonModule, NzIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private loginModal = inject(LoginModalService);
  protected userService = inject(UserService);

  openLogin(): void {
    this.loginModal.open();
  }
}
