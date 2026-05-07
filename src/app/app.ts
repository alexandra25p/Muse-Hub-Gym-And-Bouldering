import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginModal } from './shared/login-modal/login-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginModal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('muse-hub');
}
