import { ApiResponse } from '../../interfacces/response';

export interface User {
  userId?: string;
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserExists {
  usernameExists: boolean;
  emailExists: boolean;
}

export interface UserDashboard {
  totalUserCount: number;
  activeUserCount: number;
  inactiveUserCount: number;
  adminUserCount: number;
  managerUserCount: number;
  salespersonUserCount: number;
  userUserCount: number;
}

export interface UserResponse extends ApiResponse<User> {}
export interface UsersResponse extends ApiResponse<User[]> {}
export interface UserExistsResponse extends ApiResponse<UserExists> {}
export interface UserDashboardResponse extends ApiResponse<UserDashboard> {}

/*

    {
      "userId": "019401ee-8149-7294-8bf9-51dc861a7b2a",
      "username": "tbala",
      "email": "tbala@fandatech.net",
      "phone": "9940180875",
      "firstName": "Balamurugan",
      "lastName": "Thanikachalam",
      "role": "admin",
      "isActive": true
    },
    
*/
