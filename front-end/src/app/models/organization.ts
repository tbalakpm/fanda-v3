export interface Organization {
  _id?: string;
  isActive: boolean;
  code: string;
  name: string;
  description?: string;
  regdNum?: string;
  pan?: string;
  tan?: string;
  gstin?: string;
  addressId?: number;
  contactId?: number;
  activeYearId?: number;
  address?: OrgAddress;
  contact?: OrgContact;
  years: OrgYear[];
}

export interface OrgYear {
  _id?: string;
  code: string;
  beginDate: Date;
  endDate: Date;
  isActive: boolean;
  sequences?: OrgYearSequence[];
}

export interface OrgYearSequence {
  _id?: string;
  key: string;
  prefix?: string;
  current: number;
  length: number;
}

export interface OrgUser {
  email: string;
}

export interface OrgAddress {
  _id?: string;
  isActive: boolean;
  attention?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
}

export interface OrgContact {
  _id?: string;
  isActive: boolean;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  mobile?: string;
  email?: string;
  workPhone?: string;
}
