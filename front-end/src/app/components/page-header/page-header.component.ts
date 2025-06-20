import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

@Component({
  selector: 'page-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  @Input() title: string;
  @Input() breadcrumbs: string[];
  @Input() extra: { route: string; text: string };

  @Input() showSearch: boolean;
  @Input() searchDebounce = 300;
  @Output() onSearch = new EventEmitter<string>();
  searchText: string;
  debounce: any;

  onSearchChange = (value: string) => {
    this.searchText = value;
    clearTimeout(this.debounce);
    this.debounce = setTimeout(
      () => this.onSearch.emit(value),
      this.searchDebounce
    );
  };
}
