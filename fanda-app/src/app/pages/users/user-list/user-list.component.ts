//#region Angular
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
//#endregion Angular

//#region Ng Zorro
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
//#endregion Ng Zorro

//#region User
import { ColumnItem } from '../../../interfacces/column-item';
import { UserService } from '../user.service';
import { UserDataService } from '../user-data.service';
import { User, UsersResponse } from '../user';
import { Subscription } from 'rxjs';
//#endregion User

@Component({
  selector: 'app-user-list',
  imports: [
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzSwitchModule,
    NzDropDownModule,
    NzInputModule,
    NzTagModule,
    NzToolTipModule,
    NzIconModule,
    NzPopconfirmModule,
    NzFlexModule,
    NzSegmentedModule,
    NzPopconfirmModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy {
  onExport() {
    throw new Error('Method not implemented.');
  }
  onImport() {
    throw new Error('Method not implemented.');
  }
  private service = inject(UserService);
  private userDataService = inject(UserDataService);
  private userLoadSub!: Subscription;

  loading = false;
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();

  data: User[] = [];
  listOfCurrentPageData: readonly User[] = [];
  listOfDisplayData: readonly User[] = [];
  usernameSearch = '';
  usernameVisible = false;
  phoneSearch = '';
  phoneVisible = false;
  searchTimeout: any;

  listOfColumns: ColumnItem<User>[] = [
    {
      name: 'Username',
      sortOrder: 'ascend',
      sortFn: (a: User, b: User) => a.username?.localeCompare(b.username!)!,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'First Name',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.firstName?.localeCompare(b.firstName!)!,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'Last Name',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.lastName?.localeCompare(b.lastName!)!,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'Email',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.email?.localeCompare(b.email!)!,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'Phone',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.phone?.localeCompare(b.phone!)!,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'Role',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.role?.localeCompare(b.role!)!,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [
        { text: 'admin', value: 'admin' },
        { text: 'manager', value: 'manager' },
        { text: 'salesperson', value: 'salesperson' },
        { text: 'user', value: 'user' },
      ],
      filterFn: (list: string[], item: User) =>
        list.some((role) => item.role?.indexOf(role) !== -1),
      alignment: 'center',
    },
    {
      name: 'Status',
      sortOrder: null,
      sortFn: (a: User, b: User) =>
        a.isActive!.toString().localeCompare(b.isActive!.toString()),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: false,
      listOfFilter: [
        { text: 'Active', value: 'true' },
        { text: 'Inactive', value: 'false' },
      ],
      filterFn: (isActive: string, item: User) =>
        item.isActive?.toString().indexOf(isActive) !== -1,
      alignment: 'center',
    },
  ];

  ngOnInit(): void {
    this.userLoadSub = this.userDataService.UserLoaded$.subscribe(() => {
      this.refreshData();
    });
    // this.refreshData();
  }

  ngOnDestroy() {
    this.userLoadSub.unsubscribe();
  }

  refreshData() {
    this.loading = true;

    this.service
      .getUsers()
      .then((response) => response.json())
      .then((userResponse: UsersResponse) => {
        this.data = userResponse.data || [];
        this.listOfDisplayData = [...this.data];
        this.userDataService.refreshDashboard();
      })
      .finally(() => {
        this.loading = false;
      });
  }

  roleColor(role: string): string {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'manager':
        return 'blue';
      case 'salesperson':
        return 'cyan';
      case 'user':
        return 'geekblue';
      case 'guest':
        return 'magenta';
      default:
        return 'lime';
    }
  }
  onCurrentPageDataChange(listOfCurrentPageData: readonly User[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }
  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }
  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      // .filter(({ disabled }) => !disabled)
      .forEach(({ userId }) => this.updateCheckedSet(userId!, checked));
    this.refreshCheckedStatus();
  }
  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }
  refreshCheckedStatus(): void {
    // const listOfEnabledData = this.listOfCurrentPageData.filter(
    //   ({ disabled }) => !disabled
    // );

    this.checked = this.listOfCurrentPageData.every(({ userId }) =>
      this.setOfCheckedId.has(userId!)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some(({ userId }) =>
        this.setOfCheckedId.has(userId!)
      ) && !this.checked;
  }

  //#region Search
  reset(): void {
    this.usernameSearch = '';
    this.phoneSearch = '';
    this.listOfDisplayData = this.data!;
  }

  search(searchText: string) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }

    this.searchTimeout = setTimeout(() => {
      this.usernameSearch = '';
      this.phoneSearch = '';
      if (!searchText) {
        this.listOfDisplayData = this.data!;
        return;
      }

      searchText = searchText.toLocaleLowerCase();
      this.listOfDisplayData = this.data!.filter((item: User) => {
        return (
          (item.username
            ? item.username.toLocaleLowerCase().indexOf(searchText) !== -1
            : false) ||
          (item.email
            ? item.email.toLocaleLowerCase().indexOf(searchText) !== -1
            : false) ||
          (item.firstName
            ? item.firstName.toLocaleLowerCase().indexOf(searchText) !== -1
            : false) ||
          (item.lastName
            ? item.lastName.toLocaleLowerCase().indexOf(searchText) !== -1
            : false) ||
          (item.phone
            ? item.phone.toLocaleLowerCase().indexOf(searchText) !== -1
            : false) ||
          (item.role
            ? item.role.toLocaleLowerCase().indexOf(searchText) !== -1
            : false)
        );
      });
    }, 500);
    // } else {
    //   this.listOfDisplayData = this.data;
    // }
  }

  searchUsernameFn(): void {
    this.usernameVisible = false;
    this.phoneVisible = false;
    this.listOfDisplayData = this.data!.filter(
      (item: User) => item.username?.indexOf(this.usernameSearch) !== -1
    );
  }
  searchPhoneFn(): void {
    this.usernameVisible = false;
    this.phoneVisible = false;
    this.listOfDisplayData = this.data!.filter((item: User) =>
      item.phone ? item.phone.indexOf(this.phoneSearch) !== -1 : false
    );
  }
  //#endregion Search

  onChangeStatus(userId: string, value: boolean) {
    this.service
      .updateUser(userId, { isActive: value })
      .then((response) => response.json())
      .then((_) => this.refreshData());
  }
  onUserEdit(userId: string = '') {
    this.userDataService.selectUser(userId);
  }
  onDeleteUser(userId: string) {
    this.service
      .deleteUser(userId)
      .then((response) => response.json())
      .then((_) => this.refreshData());
  }
}
