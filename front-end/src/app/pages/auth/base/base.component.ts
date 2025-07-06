import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AnimationOptions } from 'ngx-lottie';

import { fadeInAnimation } from '@animations';
import { LottieAnimationComponent } from '@components';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [RouterModule, CommonModule, LottieAnimationComponent],
  templateUrl: './base.component.html',
  styleUrl: './base.component.css',
  animations: [fadeInAnimation],
})
export class BaseComponent {
  options: AnimationOptions = {
    path: 'assets/lottie/auth.json',
    autoplay: true,
    loop: true,
  };
  constructor(private router: Router) {}

  isRegisterPage() {
    return this.router.url.includes('/register');
  }
}
