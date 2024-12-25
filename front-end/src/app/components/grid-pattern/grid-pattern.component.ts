import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'grid-pattern',
  templateUrl: './grid-pattern.component.html',
  styleUrls: ['./grid-pattern.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class GridPatternComponent {
  @Input() width: number = 40;
  @Input() height: number = 40;
  @Input() x: number = -1;
  @Input() y: number = -1;
  @Input() strokeDasharray: number = 0;
  @Input() squares?: Array<[number, number]>;
  @Input() class?: string;

  id: string;

  constructor() {
    this.id = 'pattern_' + Math.random().toString(36).substring(7);
  }

  getSvgClasses(): string {
    return (
      'pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30' +
      (this.class ? ' ' + this.class : '')
    );
  }
}
