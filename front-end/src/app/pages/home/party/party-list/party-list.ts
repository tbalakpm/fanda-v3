/** biome-ignore-all lint/style/useImportType: Suppress import types */
import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';
import { Party } from '../../../../models';

interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Party> | null;
  sortDirections: NzTableSortOrder[];
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<Party> | null;
  filterMultiple: boolean;
}

export const partyColumns: ColumnItem[] = [
  {
    name: 'Code',
    sortOrder: null,
    sortFn: (a: Party, b: Party) => a.code.localeCompare(b.code),
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'Name',
    sortOrder: null,
    sortFn: (a: Party, b: Party) => a.name.localeCompare(b.name),
    sortDirections: ['ascend', 'descend', null],
    listOfFilter: [],
    filterFn: null,
    filterMultiple: false,
  },
  {
    name: 'GSTIN',
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
    filterFn: (status: boolean, item: Party) => item.isActive === status,
    filterMultiple: false,
  },
];
