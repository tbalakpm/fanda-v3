import { Product } from '../../../../models';
import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';

interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Product> | null;
  sortDirections: NzTableSortOrder[];
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<Product> | null;
  filterMultiple: boolean;
}

export const productColumns: ColumnItem[] = [
  {
    name: 'Code',
    sortOrder: 'ascend',
    sortFn: (a: Product, b: Product) => a.code.localeCompare(b.code),
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Name',
    sortOrder: null,
    sortFn: (a: Product, b: Product) => a.name.localeCompare(b.name),
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Category - Unit',
    sortOrder: null,
    sortFn: null,
    sortDirections: [null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Buying Price',
    sortOrder: null,
    sortFn: (a: Product, b: Product) => a.buyingPrice - b.buyingPrice,
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Margin %',
    sortOrder: null,
    sortFn: null,
    sortDirections: [],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Selling Price',
    sortOrder: null,
    sortFn: (a: Product, b: Product) => a.sellingPrice - b.sellingPrice,
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Tax Preference - % - Code',
    sortOrder: null,
    sortFn: null,
    sortDirections: [null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Active',
    sortOrder: null,
    sortFn: (a: Product, b: Product) => Number(a.isActive) - Number(b.isActive),
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [
      { text: 'Active', value: true },
      { text: 'Inactive', value: false },
    ],
    filterFn: (isActive: boolean, item: Product) => item.isActive === isActive,
    filterMultiple: false,
  },
  {
    name: 'Action',
    sortOrder: null,
    sortFn: null,
    sortDirections: [null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
];
