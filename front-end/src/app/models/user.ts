export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  roles: string[];
  imageUrl: string;
  isActive: boolean;
}
