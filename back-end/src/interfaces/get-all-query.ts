export interface GetAllQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  field?: string;
  value?: string | number | boolean;
  // invoiceType?: string;
}

export const convertValue = (field: string, value: string | number | boolean) => {
  return field === 'isActive' ? Boolean(value) : typeof value === 'string' ? new RegExp(value, 'i') : value;
};
