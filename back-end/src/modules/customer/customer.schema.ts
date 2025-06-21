import { z } from 'zod';
import { AddressSchema } from '../../schema/address.schema';
import { ContactSchema } from '../../schema/contact.schema';
import { GSTTreatment } from '../party/gst-treatment.enum';

export const CustomerSchema = z.object({
  customerId: z.union([z.null(), z.string().uuid().optional()]),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(50),
  description: z.union([z.null(), z.string().max(255).optional()]),
  address: AddressSchema.optional(),
  contact: ContactSchema.optional(),
  gstin: z.union([z.null(), z.string().max(15).optional()]),
  gstTreatment: z.nativeEnum(GSTTreatment),
  isActive: z.boolean().default(true)
});
