export interface Party {
  _id: string;
  code: string;
  name: string;
  gstin: string;
  contact: Contact;
  address?: Address;
  billingAddress?: Address;
  shippingAddress?: Address;
  isActive: boolean;
}

export interface Address {
  line1: string;
  line2: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Contact {
  salutation: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
}
