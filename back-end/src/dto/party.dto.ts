import type { GSTTreatment } from '../modules/party/gst-treatment.enum';
import type { AddressType, ContactType } from '../schema';

export class PartyDto {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  address?: AddressType;
  contact?: ContactType;
  gstin?: string;
  gstTreatment!: GSTTreatment;
  isActive!: boolean;

  constructor(partial: Partial<PartyDto>) {
    Object.assign(this, partial);
  }
}
