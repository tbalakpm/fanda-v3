import { AddressType, ContactType } from '../schema';

export class PartyDto {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  address?: AddressType;
  contact?: ContactType;
  isActive!: boolean;

  constructor(partial: Partial<PartyDto>) {
    Object.assign(this, partial);
  }
}
