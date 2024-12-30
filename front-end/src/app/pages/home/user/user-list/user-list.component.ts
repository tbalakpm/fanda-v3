import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { PageHeaderComponent } from '@components';
import { User } from '@models';
import { AuthService, LoaderService, UserService } from '@services';

import { UserAddComponent } from '../user-add/user-add.component';

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

  editId: string = 'new';
  constructor(
    public _loaderService: LoaderService,
    private _userService: UserService,
    private _authService: AuthService
  ) {
    this.fetchUsers();
  }

  fetchUsers() {
    this.editId = 'new';
    this._userService.getAll().subscribe(({ data, total }) => {
      this.users = [...data];
      this.total = total;
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this._userService.activate(id).subscribe(() => {
        this.users.find((p) => p.userId === id)!.isActive = true;
        this._authService.isOrgChanged.emit();
      });
    else
      this._userService.deactivate(id).subscribe(() => {
        this.users.find((p) => p.userId === id)!.isActive = false;
        this._authService.isOrgChanged.emit();
      });
  }

  deleteUser(id: string) {
    this._userService.delete(id).subscribe(() => {
      this.users = this.users.filter((p) => p.userId !== id);
    });
  }
}
