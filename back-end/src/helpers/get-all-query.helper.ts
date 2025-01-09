import { IsNull, Not, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, ILike, In } from 'typeorm';
import { FilterRule, GetAllQuery, Pagination } from '../interfaces/get-all-query';
import { ApiError, ApiStatus } from '../responses';

export const convertValue = (field: string, value: string | number | boolean) => {
  return field === 'isActive' ? Boolean(value) : value; //typeof value === 'string' ? new RegExp(value, 'i') : value;
};

export const getPagination = (query: GetAllQuery): Pagination => {
  const page = query.page || 1;
  const size = query.size || 10;
  const limit = size;

  // check if page and size are valid
  if (isNaN(page) || page < 0 || isNaN(size) || size < 0) {
    throw new ApiError('Invalid pagination params', ApiStatus.BAD_REQUEST);
  }
  // do not allow to fetch large slices of the dataset
  if (size > 100) {
    throw new ApiError('Invalid pagination params: Max size is 100', ApiStatus.BAD_REQUEST);
  }

  const offset = (page - 1) * limit;
  return { page, limit, size, offset };
};

export const getSorting = (sort?: string) => {
  if (!sort) return {};

  // check if the valid params sent is an array
  // if (typeof validParams != 'object') throw new BadRequestException('Invalid sort parameter');

  if (!sort.includes(':')) {
    sort += ':asc';
  }
  // check the format of the sort query param
  const sortPattern = /^([a-zA-Z0-9]+):(asc|desc)$/;
  if (!sort.match(sortPattern)) {
    throw new ApiError('Invalid sort parameter', ApiStatus.BAD_REQUEST);
  }

  // extract the property name and direction and check if they are valid
  const [property, direction] = sort.split(':');
  // if (!validParams.includes(property)) throw new ApiError(`Invalid sort property: ${property}`, ApiStatus.BAD_REQUEST);
  return { [property]: direction };
};

export const getFiltering = (filter?: string) => {
  if (!filter) return {};

  // check if the valid params sent is an array
  // if (typeof data != 'object') throw new BadRequestException('Invalid filter parameter');

  const filters = filter.split(':');
  if ((filters.length == 2 && !filters[1].match(/^(isnull|isnotnull)$/)) || !filters[1].match(/^(eq|neq|gt|gte|lt|lte|like|nlike|in|nin)$/)) {
    filter = `${filters[0]}:eq:${filters[1]}`;
  }
  // console.log('FILTER', filter);

  const filterPattern = /^[a-zA-Z0-9_]+:(eq|neq|gt|gte|lt|lte|like|nlike|in|nin):[a-zA-Z0-9._,-]+$/;
  const nullFilterPattern = /^[a-zA-Z0-9_]+:(isnull|isnotnull)$/;
  // validate the format of the filter, if the rule is 'isnull' or 'isnotnull' it don't need to have a value
  if (!filter.match(filterPattern) && !filter.match(nullFilterPattern)) {
    throw new ApiError('Invalid filter parameter', ApiStatus.BAD_REQUEST);
  }

  // extract the parameters and validate if the rule and the property are valid
  const [property, rule, value] = filter.split(':');
  // if (!data.includes(property)) throw new ApiError(`Invalid filter property: ${property}`, ApiStatus.BAD_REQUEST);

  if (!Object.values(FilterRule).includes(rule as FilterRule)) {
    throw new ApiError(`Invalid filter rule: ${rule}`, ApiStatus.BAD_REQUEST);
  }

  if (rule == FilterRule.IS_NULL) return { [property]: IsNull() };
  if (rule == FilterRule.IS_NOT_NULL) return { [property]: Not(IsNull()) };
  if (rule == FilterRule.EQUALS) return { [property]: value };
  if (rule == FilterRule.NOT_EQUALS) return { [property]: Not(value) };
  if (rule == FilterRule.GREATER_THAN) return { [property]: MoreThan(value) };
  if (rule == FilterRule.GREATER_THAN_OR_EQUALS) return { [property]: MoreThanOrEqual(value) };
  if (rule == FilterRule.LESS_THAN) return { [property]: LessThan(value) };
  if (rule == FilterRule.LESS_THAN_OR_EQUALS) return { [property]: LessThanOrEqual(value) };
  if (rule == FilterRule.LIKE) return { [property]: ILike(`%${value}%`) };
  if (rule == FilterRule.NOT_LIKE) return { [property]: Not(ILike(`%${value}%`)) };
  if (rule == FilterRule.IN) return { [property]: In(value.split(',')) };
  if (rule == FilterRule.NOT_IN) return { [property]: Not(In(value.split(','))) };
  return {};
};

// export const getFiltering = (query: GetAllQuery): Filtering[] => {
//   const filters: Filtering[] = [];
//   if (query.field && query.value) {
//     filters.push({ property: query.field, rule: 'eq', value: convertValue(query.field, query.value).toString() });
//   }
//   // if (query.invoiceType) {
//   //   filters.push({ property: 'invoiceType', rule: 'eq', value: query.invoiceType });
//   // }
//   return filters;
// };

// export const getSorting = (query: GetAllQuery): Sorting => {
//   const sort = query.sort || 'id';
//   const order = query.order || 'asc';
//   return { property: sort, direction: order.toUpperCase() };
// };

// export const getQuery = (query: GetAllQuery): { pagination: Pagination; sorting: Sorting; filtering: Filtering[] } => {
//   const pagination = getPagination(query);
//   const sorting = getSorting(query);
//   const filtering = getFiltering(query);
//   return { pagination, sorting, filtering };
// };
