import {TableSchema} from "../../types/orm";

export const userSchema: TableSchema = {
    id: {
        type: 'number',
        primary: true,
        nullable: false,
        autoIncrement: true
    },
    email: {
        type: 'string',
        unique: true,
        nullable: false
    },
    password: {
        type: 'string',
        nullable: false
    },
    verified: {
        type: 'boolean',
        defaultValue: false,
        nullable: false
    },
    profile_id: {
        type: 'number',
        nullable: true,
        relation: {
            type: 'one-to-one',
            table: 'profiles',
            field: 'id',
            onDelete: 'SET NULL'
        }
    }
}

export const publicUserSchema: TableSchema = {
    id: {
        type: 'number',
        primary: true,
        nullable: false
    },
    username: {
        type: 'string',
        unique: true,
        nullable: false
    },
    first_name: {
        type: 'string',
        nullable: true
    },
    last_name: {
        type: 'string',
        nullable: true
    },
    user_id: {
        type: 'number',
        nullable: true,
        relation: {
            type: 'one-to-one',
            table: 'users',
            field: 'id',
            onDelete: 'SET NULL'
        }
    }
}
