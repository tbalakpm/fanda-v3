import { AfterViewInit, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { AnimationOptions } from 'ngx-lottie';

import { NzIconModule } from 'ng-zorro-antd/icon';

import { LottieAnimationComponent } from '@components';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    RouterModule,
    NzButtonModule,
    NzIconModule,
    LottieAnimationComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements AfterViewInit {
  options: AnimationOptions = {
    path: 'assets/lottie/landing.json',
    autoplay: true,
    loop: true,
  };

  styles: {
    top: number;
    left: string;
    animationDelay: string;
    animationDuration: string;
  }[] = [];

  constructor() {
    this.styles = [...new Array(20)].map(() => ({
      top: -5,
      left: Math.floor(Math.random() * window.innerWidth) + 'px',
      animationDelay: Math.random() * 1 + 0.2 + 's',
      animationDuration: Math.floor(Math.random() * 8 + 2) + 's',
    }));
  }

  ngAfterViewInit(): void {
    const glassyButtons = document.querySelectorAll('.glassy-button');
    glassyButtons.forEach((button: any) => {
      button.addEventListener('mousemove', (event: any) => {
        const centerX = button.offsetWidth / 2;
        const centerY = button.offsetHeight / 2;

        const offsetX = event.offsetX - centerX;
        const offsetY = event.offsetY - centerY;

        button.style.setProperty('--_x-motion', `${offsetX}px`);
        button.style.setProperty('--_y-motion', `${offsetY}px`);
      });
    });
  }
}
