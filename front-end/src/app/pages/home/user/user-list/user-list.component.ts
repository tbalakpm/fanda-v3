import { Component } from '@angular/core';

import { UserAddComponent } from '../user-add/user-add.component';
import { User } from '../../../../models';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthService, LoaderService, UserService } from '../../../../services';
import { CommonModule } from '@angular/common';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { PageHeaderComponent } from '../../../../components/page-header/page-header.component';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    UserAddComponent,

    CommonModule,
    FormsModule,

    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzToolTipModule,
    NzSwitchModule,
    NzPopconfirmModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  users: User[] = [];

  total: number;
  pageIndex = 1;
  pageSize = 10;

  editId: string = 'new';
  constructor(
    public _loaderService: LoaderService,
    private _userService: UserService,
    private _authService: AuthService
  ) {}

  fetchUsers() {
    this.editId = 'new';
    // this._loaderService.showLoader();
    this._userService
      .getPaged({ page: this.pageIndex, limit: this.pageSize })
      .subscribe((users) => {
        // console.log(users.items);
        this.users = [...users.items];
        this.total = users.total;
        this._loaderService.hideLoader();
      });
  }

  onQueryParamsChange(qp: NzTableQueryParams) {
    this.pageIndex = qp.pageIndex;
    this.pageSize = qp.pageSize;
    this.fetchUsers();
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this._userService.activate(id).subscribe(() => {
        this.users.find((p) => p._id === id)!.isActive = true;
        this._authService.isOrgChanged.emit();
      });
    else
      this._userService.deactivate(id).subscribe(() => {
        this.users.find((p) => p._id === id)!.isActive = false;
        this._authService.isOrgChanged.emit();
      });
  }

  deleteUser(id: string) {
    this._userService.delete(id).subscribe(() => {
      this.users = this.users.filter((p) => p._id !== id);
    });
  }
}
