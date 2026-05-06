import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NzButtonModule, NzIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
