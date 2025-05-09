import { Component, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';

import { UserDashboard, UserDashboardResponse } from '../user';
import { UserService } from '../user.service';
import { UserDataService } from '../user-data.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    DecimalPipe,
    NzGridModule,
    NzStatisticModule,
    NzDividerModule,
    NzFlexModule,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  userDashboard?: UserDashboard;
  private userRefreshDashboardSub!: Subscription;

  constructor(
    private userService: UserService,
    private userDataService: UserDataService
  ) {}

  ngOnInit(): void {
    this.userRefreshDashboardSub =
      this.userDataService.UserRefreshDashboard$.subscribe((refresh) => {
        if (refresh) this.loadDashboard();
      });
  }

  ngOnDestroy() {
    this.userRefreshDashboardSub.unsubscribe();
  }

  loadDashboard() {
    this.userService
      .dashboard()
      .then((response) => response.json())
      .then((data: UserDashboardResponse) => {
        this.userDashboard = data.data!;
      });
  }
}
