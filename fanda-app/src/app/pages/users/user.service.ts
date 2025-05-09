import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User, UserResponse } from './user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTkyZmM1ZS0wMDkzLTdjY2MtYTIwYS1kYzg0NGE1YmFkMWMiLCJpYXQiOjE3MzA4MTI0MjQsImV4cCI6NDg4NDQxMjQyNH0.kpqWbQXwp9GsKhB-Yd1eGPdq8NHw5mj_9xpRT5Ggmkw';
  constructor() {}

  getUsers() {
    return fetch(`${environment.apiUrl}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || this.token} `,
      },
    });
  }
  getUser(id: string) {
    return fetch(`${environment.apiUrl}/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || this.token} `,
      },
    });
  }
  createUser(user: User) {
    return fetch(`${environment.apiUrl}/users`, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || this.token} `,
      },
    });
  }
  updateUser(id: string, user: User) {
    return fetch(`${environment.apiUrl}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || this.token} `,
      },
    });
  }
  deleteUser(id: string) {
    return fetch(`${environment.apiUrl}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || this.token} `,
      },
    });
  }
  dashboard() {
    return fetch(`${environment.apiUrl}/users/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || this.token} `,
      },
    });
  }
  checkExists(username?: string, email?: string): Promise<Response> {
    return fetch(
      `${environment.apiUrl}/users/exists?username=${username}&email=${email}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            localStorage.getItem('token') || this.token
          }`,
        },
      }
    );
  }
}
