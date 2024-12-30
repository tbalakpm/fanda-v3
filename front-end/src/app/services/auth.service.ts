import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { OrgYear, Organization, LoginResponse } from '../models';

export interface Login {
  username: string;
  password: string;
}

export interface LoginResponseData {
  userId: string;
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  roles: string;
  isActive: boolean;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: BehaviorSubject<LoginResponseData> =
    new BehaviorSubject<LoginResponseData>(
      JSON.parse(sessionStorage.getItem('user')!)
    );

  private organization: BehaviorSubject<Organization> =
    new BehaviorSubject<Organization>(
      JSON.parse(sessionStorage.getItem('organization')!)
    );

  private year: BehaviorSubject<OrgYear> = new BehaviorSubject<OrgYear>(
    this.organization.getValue()?.years[
      this.organization.getValue().years.length - 1
    ]
  );

  public isOrgChanged = new EventEmitter();

  constructor(private http: HttpClient, private route: Router) {}

  public login(user: Login): Observable<LoginResponse<LoginResponseData>> {
    return this.http.post<LoginResponse<LoginResponseData>>(
      `${environment.ICMS_API_URL}/auth/login`,
      user
    );
  }

  public logout(): void {
    sessionStorage.removeItem('user');
    this.route.navigate(['/auth/login']);
  }

  public isLoggedIn(): boolean {
    return !!sessionStorage.getItem('user');
  }

  public isOrgSelected() {
    if (!!this.organization.getValue()) {
      return true;
    } else {
      this.route.navigate(['/home/select-organization']);
      return false;
    }
  }

  public getUser(): Observable<LoginResponseData> {
    return this.user.asObservable();
  }

  public setUser(user: LoginResponseData): void {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.user.next(user);
  }

  public hasRole(role: string): boolean {
    const user: LoginResponseData = JSON.parse(sessionStorage.getItem('user')!);
    return user?.roles.includes(role);
  }

  public setOrganization(organization: Organization): void {
    console.log(organization);
    sessionStorage.setItem('organization', JSON.stringify(organization));
    this.organization.next(organization);
    console.log(organization.years[organization.years.length - 1]);
    this.year.next(organization.years[organization.years.length - 1]);
    this.route.navigate(['/home/sales']);
  }

  public getOrganization(): Observable<Organization> {
    return this.organization.asObservable();
  }

  public getYear(): Observable<OrgYear> {
    return this.year.asObservable();
  }

  public setYear(year: OrgYear): void {
    this.year.next(year);
  }
}
