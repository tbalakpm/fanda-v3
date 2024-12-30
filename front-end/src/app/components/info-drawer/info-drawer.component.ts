import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';

@Component({
  selector: 'info-drawer',
  standalone: true,
  imports: [CommonModule, NzDrawerModule],
  templateUrl: './info-drawer.component.html',
  styleUrl: './info-drawer.component.scss',
})
export class InfoDrawerComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = '';
  @Output() onClose = new EventEmitter<boolean>();

  isLoading: boolean = false;

  private _data: any;
  @Input()
  set data(value: any) {
    this.isLoading = true;
    this._data = this.cleanData(value);
    this.keys = ['Details'];

    Object.keys(value).forEach((key) => {
      if (value[key] instanceof Object) {
        this.keys.push(key.toTitleCase());
        let i = this.keys.length - 1;
        this.values[i] = {};
        Object.keys(value[key]).forEach((subKey) => {
          this.values[i] = {
            ...this.values[i],
            [subKey.toTitleCase()]: value[key][subKey],
          };
        });
      } else
        this.values[0] = { ...this.values[0], [key.toTitleCase()]: value[key] };
    });

    this.isLoading = false;
  }
  get data(): any {
    return this._data;
  }

  keys: string[] = [];
  values: any[] = [];

  onDrawerClose(): void {
    this.isVisible = false;
    this.onClose.emit(false);
  }

  cleanData(data: any): void {
    let unWantedKeys = ['_id', 'createdAt', 'updatedAt', 'years'];
    Object.keys(data).forEach((key) => {
      if (unWantedKeys.includes(key)) delete data[key];
      if (data[key] === null || data[key] === undefined) delete data[key];

      if (data[key] instanceof Object) {
        this.cleanData(data[key]);
      }
    });
  }
}
