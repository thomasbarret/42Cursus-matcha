import { PoolConfig } from 'pg';

export type ColumnType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'date'
    | 'text'
    | 'json'

export type RelationType =
    | 'one-to-one'
    | 'one-to-many'
    | 'many-to-one'


export interface ColumnDefinition {
    type: ColumnType
    primary?: boolean
    unique?: boolean
    nullable?: boolean
    defaultValue?: any
    autoIncrement?: boolean

    relation?: {
        type: RelationType
        table: string
        field: string
        onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
        onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
    }
}


export interface TableSchema {
    [key: string]: ColumnDefinition
}





export interface OrmOptions {
    postgresConfig: PoolConfig;
}

export interface ORM {
    query(text: string, params?: any[]): Promise<any[]>;

    findAll(table: string): Promise<any[]>;

    findById(table: string, id: number | string): Promise<any[]>;

    create(table: string, data: Record<string, any>): Promise<any[]>;

    update(table: string, id: number | string, data: Record<string, any>): Promise<any[]>;

    delete(table: string, id: number | string): Promise<any[]>;

    transaction(queries: { text: string; params?: any[] }[]): Promise<any[]>;

    validateTableName(table: string): void;

    validateColumnName(column: string): void;

    createTable(tableName: string, schema: TableSchema): Promise<void>

    createTableWithRelations(tableName: string, schema: TableSchema): Promise<void>

    buildBaseColumnDefinition(columnName: string, columnDef: ColumnDefinition): string;

    findWithRelations(
        table: string,
        relations?: {
            [relationName: string]: {
                table: string
                type?: RelationType
            }
        }
    ): Promise<any[]>

    formatDefaultValue(value: any): string


}

declare module 'fastify' {
    interface FastifyInstance {
        orm: ORM;
    }
}
