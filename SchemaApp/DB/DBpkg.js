import { createLink, createSchema } from './CompareSchemaDB.js'
import { loadDBdata, getDBdata, openDB, closeDB } from './CompareSchemaDB.js'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename, '');
const fileStr = __filename.replace(__dirname, '');

let DBtypes;
let DBs;
let schema;
let links;
let schemaLinks;
let newData = true;

let connRetVal = await openDB();
let DBconnection = connRetVal.DBconn;
await loadDBdata(DBconnection)
    .then((loadRetVal) => {
        DBtypes = getDBdata('DBtypes');
        DBs = getDBdata('targetDBs');
        schema = getDBdata('schema');
        links = getDBdata('links');
        schemaLinks = getDBdata('schemaLinks');
        //console.log({ loadRetVal: loadRetVal, DBtypes: DBtypes, DBs: DBs, schema: schema, schemaLinks: schemaLinks })
        newData = false;
        let msgStr = ": Got DB values. Application loaded.";
        console.log("LOAD" + msgStr);
    }).catch(error => {
        let msgStr = ": Error getting DB values. Please restart application.";
        console.error(fileStr + ": LOAD" + msgStr + error.message);
        newData = true;
    });

export async function DB_createSchema(DBtype, DBserver, targetDB, schema) {
    let fnStr = fileStr + "::DB_createSchema";
    console.log(fnStr + ': Entered ...');

    let retVal = true;

    const DBretVal = await openDB();
    let DBconn = DBretVal.DBconn;
    try {
        let schRetVal = await createSchema(DBconn, DBtype, DBserver, targetDB, schema);
        if (!schRetVal) {
            let msgStr = ": Error creating schema.";
            console.error(fnStr + msgStr);
            newData = false;
        } else {
            let msgStr = ": Schema created.";
            console.log(fnStr + msgStr);
            newData = true;
        }
    } catch (error) {
        newData = false;
        retVal = false;
        throw error;
    }

    closeDB(DBconn);
    return retVal;
}

export async function DB_createLink(DBtype, DBserver, targetDB, schema, subject, tableName) {
    let fnStr = fileStr + "::DB_createLink";
    console.log(fnStr + ': Entered ...');

    let retVal = true;

    const DBretVal = await openDB();
    let DBconn = DBretVal.DBconn;
    try {
        let linkRetVal = await createLink(DBconn, DBtype, DBserver, targetDB, schema, subject, tableName);
        if (!linkRetVal) {
            let msgStr = ": Error creating link.";
            console.error(fnStr + msgStr);
            newData = false;
        } else {
            let msgStr = ": Link created.";
            console.log(fnStr + msgStr);
            newData = true;
        }
    } catch (error) {
        newData = false;
        retVal = false;
        throw error;
    }

    closeDB(DBconn);
    return retVal;
}

export function DB_refreshData() {
    let fnStr = fileStr + "::DB_refreshData";
    console.log(fnStr + ": Entered ...");

    let retVal = true;

    loadDBdata(DBconnection)
        .then(() => {
            DBtypes = getDBdata('DBtypes');
            DBs = getDBdata('targetDBs');
            schema = getDBdata('schema');
            links = getDBdata('links');
            schemaLinks = getDBdata('schemaLinks');
            newData = false;
            let msgStr = ": Got DB values.";
            console.log(fnStr + msgStr);
        }).catch(error => {
            newData = true;
            retVal = false;
            let msgStr = ": Error getting DB values.";
            console.error("LOAD " + error.message + msgStr);
            throw error;
        });

    return { retVal: retVal, DBtypes: DBtypes, DBs: DBs, schema: schema, links: links, schemaLinks: schemaLinks };
}
