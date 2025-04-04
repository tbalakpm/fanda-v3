import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { NzCollapseModule } from 'ng-zorro-antd/collapse';
// import { NzIconModule } from 'ng-zorro-antd/icon';

import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
// import { UserEditComponent } from './user-edit/user-edit.component';
import { UserListComponent } from './user-list/user-list.component';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    // NzCollapseModule,
    // NzIconModule,
    UserListComponent,
    // UserEditComponent,
    UserDashboardComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  constructor() {}
}

/* public userDataService: UserDataService */
/* [userId]="(userDataService.UserSelected$ | async) ?? undefined" */
