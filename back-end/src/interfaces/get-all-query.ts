export interface GetAllQuery {
  page?: number;
  size?: number;
  sort?: string; // field:direction (asc or desc)
  filter?: string; // field:rule:value (eq, neq, gt, gte, lt, lte, like, nlike, in, nin, isnull, isnotnull)
  //limit?: number;
  //order?: 'asc' | 'desc';
  // field?: string;
  // value?: string | number | boolean;
  // invoiceType?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  size: number;
  offset: number;
}

// export interface Sorting {
//   property: string;
//   direction: string;
// }

// export interface Filtering {
//   property: string;
//   rule: string;
//   value: string;
// }

// valid filter rules
export enum FilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  LIKE = 'like',
  NOT_LIKE = 'nlike',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull'
}

export type PaginatedResponse<T> = {
  totalItems: number;
  items: T[];
  page: number;
  size: number;
};
