import { Component, Input } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  imports: [LottieComponent],
  selector: 'lottie',
  standalone: true,
  template: ` <ng-lottie [options]="options" containerClass="lottie" /> `,
})
export class LottieAnimationComponent {
  @Input()
  options: AnimationOptions;

  constructor() {}
}
