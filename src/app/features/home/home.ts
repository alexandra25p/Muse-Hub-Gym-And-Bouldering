import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LoginModalService } from '../../core/services/login-modal.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NzButtonModule, NzIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(private loginModal: LoginModalService) {}

  openLogin(): void {
    this.loginModal.open();
  }
}
