import { ColumnType } from 'typeorm';

export const auditDateDataType = (): ColumnType => {
  switch (process.env.DB_TYPE) {
    case 'postgres':
      return 'timestamp with time zone';
    case 'better-sqlite3':
    case 'sqlite':
      return 'datetime';
    case 'mysql':
    case 'mariadb':
      return 'timestamp';
    case 'mssql':
      return 'datetimeoffset';
    default:
      return 'timestamp with time zone';
  }
};

export const dateTimeDataType = (): ColumnType => {
  switch (process.env.DB_TYPE) {
    case 'postgres':
      return 'timestamp with time zone';
    case 'better-sqlite3':
    case 'sqlite':
      return 'datetime';
    case 'mysql':
    case 'mariadb':
      return 'datetime';
    case 'mssql':
      return 'datetimeoffset';
    default:
      return 'timestamp with time zone';
  }
};

export const enumDataType = (): ColumnType => {
  switch (process.env.DB_TYPE) {
    case 'postgres':
      return 'enum';
    case 'better-sqlite3':
    case 'sqlite':
      return 'text';
    case 'mysql':
    case 'mariadb':
      return 'enum';
    case 'mssql':
      return 'varchar';
    default:
      return 'enum';
  }
};

export const enumTypeDataType = (enumName: string): string => {
  switch (process.env.DB_TYPE) {
    case 'postgres':
      return `ENUM(${enumName})`;
    case 'better-sqlite3':
    case 'sqlite':
      return `TEXT CHECK(${enumName} IN (${enumName}))`;
    case 'mysql':
    case 'mariadb':
      return `ENUM(${enumName})`;
    case 'mssql':
      return 'VARCHAR(255)';
    default:
      return `ENUM(${enumName})`;
  }
};
