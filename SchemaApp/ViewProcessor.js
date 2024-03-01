import { DB_refreshData, DB_createSchema, DB_createLink } from './DB/DBpkg.js'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileStr = __filename.replace(__dirname, '');

export function dataFromDB(DBtype = 'PostgreSQL', DBserver = 'localhost', targetDB = 'AdventureWorks') {
    const fnStr = fileStr + '::dataFromDB';
    console.log(fnStr + ': Entered ...');

    const DBretVal = DB_refreshData(DBtype, DBserver, targetDB);
    if (!DBretVal.retVal) {
        console.error(fnStr + ": False returned.");
        return DBretVal;
    }
    else {
        //console.log(DBretVal);
        return DBretVal;
    }
}

export async function createLink(DBtype, DBserver, targetDB, schema, subject, tableName) {
    const fnStr = fileStr + '::createLink';
    console.log(fnStr + ': Entered ...');

    return DB_createLink(DBtype, DBserver, targetDB, schema, subject, tableName);
};

export async function createSchema(DBtype, DBserver, targetDB, schema) {
    const fnStr = fileStr + '::createSchema';
    console.log(fnStr + ': Entered ...');

    return DB_createSchema(DBtype, DBserver, targetDB, schema);
};
