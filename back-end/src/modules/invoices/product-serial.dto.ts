import type { GtnGeneration } from '../product/gtn-generation.enum';

export class ProductSerialDto {
  product?: {
    productId?: string;
    isPriceInclusiveTax?: boolean;
    gtnGeneration?: GtnGeneration;
  };
  serial?: {
    length?: number;
    current?: number;
    prefix?: string;
  };
}
