import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';
import { Organization } from '../../../../models';

interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Organization> | null;
  sortDirections: NzTableSortOrder[];
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<Organization> | null;
  filterMultiple: boolean;
}

export const orgColumns: ColumnItem[] = [
  {
    name: 'Code',
    sortOrder: null,
    sortFn: (a: Organization, b: Organization) => a.code.localeCompare(b.code),
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Name',
    sortOrder: 'ascend',
    sortFn: (a: Organization, b: Organization) => a.name.localeCompare(b.name),
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Description',
    sortOrder: null,
    sortFn: null,
    sortDirections: [null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Status',
    sortOrder: null,
    sortFn: null,
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [
      { text: 'Active', value: true },
      { text: 'In Active', value: false },
    ],
    filterFn: (status: boolean, item: Organization) => item.isActive === status,
    filterMultiple: false,
  },
];
