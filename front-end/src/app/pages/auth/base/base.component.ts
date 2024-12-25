import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LottieAnimationComponent } from '../../../components/lottie/lottie.component';
import { AnimationOptions } from 'ngx-lottie';
import { fadeInAnimation } from '../../../animations';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [RouterModule, CommonModule, LottieAnimationComponent],
  templateUrl: './base.component.html',
  styleUrl: './base.component.scss',
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
