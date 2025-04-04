import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private UserSelectedSubject = new BehaviorSubject<string>('');
  private UserLoadedSubject = new BehaviorSubject<boolean>(false);
  private UserRefreshDashboardSubject = new BehaviorSubject<boolean>(false);

  public UserSelected$ = this.UserSelectedSubject.asObservable();
  public UserLoaded$ = this.UserLoadedSubject.asObservable();
  public UserRefreshDashboard$ =
    this.UserRefreshDashboardSubject.asObservable();

  constructor() {}

  public selectUser(userId: string) {
    this.UserSelectedSubject.next(userId);
  }
  public loadUsers() {
    this.UserLoadedSubject.next(true);
  }
  public refreshDashboard() {
    this.UserRefreshDashboardSubject.next(true);
  }
}
