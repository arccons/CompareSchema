import sqlite3 from 'sqlite3';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { error } from 'console';

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileStr = __filename.replace(__dirname, '');

export async function openDB() {
    const dbStr = join(__dirname, 'CompareSchema-DEV.db');
    const DBconn = new sqlite3.Database(dbStr, sqlite3.OPEN_READWRITE, (error) => {
        if (error) {
            console.log("Error opening database file." + error.message);
            throw error;
        }
    });
    return { DBretVal: true, DBconn: DBconn }
}

export async function closeDB(DBconnection) {
    await DBconnection.close((error => {
        if (error) {
            console.error(error.message);
            throw error;
        } else {
            console.log('Closed the database connection.');
            return true;
        }
    }));
}

const DBtypes = ['PostgreSQL', 'SQLserver'];
// [{DBtype: 'DBtype', DBlist: [{DBserver: 'DBserver', targetDB: 'targetDB'}]}]
let DBs = [];
//[{DBtype: 'DBtype', DBserver: 'DBserver', targetDB: 'targetDB', schemaList: ['schema'], 
// DBstr: '[DBtype] DBserver.targetDB'}]
let schema = [];
let links = [];
// [{DBtype: 'DBtype', DBserver: 'DBserver', targetDB: 'targetDB', schema: 'schema', 
// linksList: [{ subject: 'subject', table: 'tableName' }], 
// DBstr: '[DBtype] DBserver.targetDB', 
// schemaStr: '[DBtype] DBserver.targetDB.schema'}]
let schemaLinks = [];

export async function createLink(DBconnection, DBtype, DBserver, targetDB, schema, subject, tableName) {
    let fnStr = fileStr + "::createLink";
    //console.log(fnStr + ": Entered ...");

    const get_schema_id_sql = `SELECT schema_id FROM schema WHERE DBtype = '${DBtype}' AND DBserver = '${DBserver}' AND targetDB = '${targetDB}' AND schema = '${schema}'`;
    try {
        const schRows = await DBread(DBconnection, get_schema_id_sql);
        if (schRows.length === 1) {
            let schema_id = schRows[0].schema_id;
            const insert_link_sql = `INSERT INTO links (schema_id, subject, tableName) VALUES('${schema_id}','${subject}','${tableName}')`;
            await DBwrite(DBconnection, insert_link_sql)
                .then(() => {
                    console.log(fnStr + ": New link inserted.");
                    return true;
                })
                .catch(error => {
                    console.error(fnStr + ": Insert link failed. " + error.message);
                    throw error;
                })
        } else { throw Error("Unique schema not found."); }
    } catch (error) { throw Error("Error while inserting new link.", { cause: error }); }
}

export async function createSchema(DBconnection, DBtype, DBserver, targetDB, schema) {
    const fnStr = fileStr + "::createSchema";
    //console.log(fnStr + ": Entered ...");

    const get_schema_id_sql = `SELECT schema_id FROM schema WHERE DBtype = '${DBtype}' AND DBserver = '${DBserver}' AND targetDB = '${targetDB}' AND schema = '${schema}'`;
    try {
        const schRows = await DBread(DBconnection, get_schema_id_sql);
        if (schRows.length === 0) {
            const insert_schema_sql = `INSERT INTO schema (DBtype, DBserver, targetDB, schema) VALUES('${DBtype}','${DBserver}','${targetDB}','${schema}')`;
            await DBwrite(DBconnection, insert_schema_sql)
                .then(() => {
                    console.log(fnStr + ": New schema inserted.");
                    return true;
                })
                .catch(error => {
                    console.error(fnStr + ": Insert schema failed. " + error.message);
                    throw error;
                })
        } else { throw Error("Schema exists."); }
    } catch (error) { throw Error("Error while inserting new schema.", { cause: error }); }
}

async function DBread(DBconnection, read_sql) {
    const fnStr = fileStr + "::DBread";
    //console.log(fnStr + ": Entered... ");

    return new Promise(function (resolve, reject) {
        DBconnection.all(read_sql, [], (error, DBrows) => {
            if (error) { console.error(fnStr + error.message); reject(fnStr + error.message); }
            else { resolve(DBrows); }
        });
    });
}

async function DBwrite(DBconnection, write_sql) {
    const fnStr = fileStr + "::DBread";
    console.log(fnStr + ": Entered... ");

    return new Promise(function (resolve, reject) {
        DBconnection.run(write_sql, [], (error => {
            if (error) { reject(error); }
            else { resolve(true); }
        }));
    });
}

export async function loadDBdata(DBconnection) {
    let fnStr = fileStr + "::loadDBdata";
    console.log(fnStr + ": Entered ...");

    let retVal = true;
    await getDBs(DBconnection)
        .then(DBsRetVal => {
            if (!DBsRetVal.retVal) {
                retVal = false;
                throw Error("Error getting DBs from DB.");
            } else {
                DBs = [...DBsRetVal.retObj];
                //console.log(fnStr + ": Logging DBs after refresh - " + DBs)
            }
        })
        .then(async () => {
            await getSchema(DBconnection)
                .then(schemaRetVal => {
                    if (!schemaRetVal.retVal) {
                        retVal = false;
                        throw Error("Error getting schema from DB.");
                    } else {
                        schema = [...schemaRetVal.retObj];
                        //console.log(fnStr + ": Logging schema after refresh - " + schema);
                    }
                })
        })
        .then(async () => {
            await getLinks(DBconnection)
                .then(linksRetVal => {
                    if (!linksRetVal.retVal) {
                        retVal = false;
                        throw Error("Error getting links from DB.");
                    } else {
                        links = [...linksRetVal.retObj];
                        //console.log(fnStr + ": Logging links after refresh - " + links);
                    }
                })
        })
        .then(async () => {
            await getSchemaLinks(DBconnection)
                .then(schemaLinkRetVal => {
                    if (!schemaLinkRetVal.retVal) {
                        retVal = false;
                        throw Error("Error getting links from DB.");
                    } else {
                        schemaLinks = [...schemaLinkRetVal.retObj];
                        //console.log(fnStr + ": Logging schemaLinks after refresh - " + schemaLinks);
                    }
                })
        })
        .catch(error => {
            console.error(fnStr + ": Error after refresh. " + error.message);
            retVal = false;
            throw error;
        })
        .finally(() => { return retVal; })
}

async function getDBs(DBconnection) {
    let fnStr = fileStr + "::getDBs";
    console.log(fnStr + ": Entered ... ");

    let DBsLocal = [];
    let retVal = true;
    const DBs_sql = `SELECT DISTINCT DBtype, DBserver, targetDB FROM schema GROUP BY DBtype ORDER BY DBserver, targetDB `;

    try {
        const DBrows = await DBread(DBconnection, DBs_sql);
        //console.log(fnStr + ": Logging DBrows " + DBrows);

        if (DBrows.length > 0) { DBsLocal.push(...DBrows); }

        /* if (DBrows.length > 0) {
            DBtypes.forEach(dbt => {
                let dbtItems = [];
                let DBlistItems = [];
                let dbtFound = false;
                DBrows.forEach(DBrow => {
                    if (DBrow.DBtype === dbt) {
                        if (!dbtFound) {
                            dbtItems.push({ DBtype: dbt, DBlist: DBlistItems });
                            dbtFound = true;
                        }
                        DBlistItems.push({ DBserver: DBrow.DBserver, targetDB: DBrow.targetDB });
                    }
                });
                if (dbtItems.length > 0) {
                    DBsLocal.push(...dbtItems);
                    //console.log(...DBsLocal);
                }
            });
        } */
    } catch (error) {
        console.error(error);
        retVal = false;
        throw error;
    } finally { return { retVal: retVal, retObj: new Array(...DBsLocal) }; }
}

async function getSchema(DBconnection) {
    let fnStr = fileStr + "::getSchema";
    console.log(fnStr + ": Entered ... ");

    const DB_sch_sql_1 = `SELECT DBtype, DBserver, targetDB, schema, schema_id `;
    const DB_sch_sql_2 = `, DBtype || '.' || DBserver || '.' || targetDB AS DBstr `;
    const DB_sch_sql_3 = `, DBserver || '.' || targetDB || '.' || schema AS schemaStr `;
    const DB_sch_sql_4 = `FROM schema ORDER BY DBtype, DBserver, targetDB, schema`;
    const DB_sch_sql = DB_sch_sql_1 + DB_sch_sql_2 + DB_sch_sql_3 + DB_sch_sql_4;

    let schemaLocal = [];
    let retVal = true;

    try {
        const schemaRows = await DBread(DBconnection, DB_sch_sql);
        //console.log(fnStr + ": Logging schemaRows " + schemaRows);

        if (schemaRows.length > 0) { schemaLocal.push(...schemaRows); }

        /*         let schemaObjs = [];
                DBs.forEach(DB => {
                    DB.DBlist.forEach(DBlistItem => {
                        let foundDB = false;
                        let schemaList = [];
                        schemaRows.forEach(schemaRow => {
                            if (DB.DBtype === schemaRow.DBtype
                                && DBlistItem.DBserver === schemaRow.DBserver
                                && DBlistItem.targetDB === schemaRow.targetDB) {
                                if (!foundDB) {
                                    schemaObjs.push({
                                        DBtype: schemaRow.DBtype,
                                        DBserver: schemaRow.DBserver,
                                        targetDB: schemaRow.targetDB,
                                        schemaList: schemaList,
                                        DBstr: schemaRow.DBstr
                                    });
                                    foundDB = true;
                                }
                                schemaList.push(schemaRow.schema);
                            }
                        })
                    });
                    if (schemaObjs.length > 0) {
                        schemaLocal.push(...schemaObjs);
                        //console.log(...schemaLocal);
                    }
                }) */
    } catch (error) {
        console.error(error);
        retVal = false;
    } finally {
        return { retVal: retVal, retObj: new Array(...schemaLocal) };
    }
}

async function getLinks(DBconnection) {
    let fnStr = fileStr + "::getLinks";
    console.log(fnStr + ": Entered ... ");

    const links_sql_1 = `SELECT DISTINCT schema_id, subject, tableName `;
    const links_sql_2 = `FROM links ORDER BY schema_id, subject, tableName`;
    const links_sql = links_sql_1 + links_sql_2;

    let linksLocal = [];
    let retVal = true;

    try {
        const linkRows = await DBread(DBconnection, links_sql);
        //console.log(fnStr + ": Logging linkRows " + linkRows);

        if (linkRows.length > 0) { linksLocal.push(...linkRows); }

        /* let linkObjs = [];
        DBs.forEach(DB => {
            DB.DBlist.forEach(DBlistItem => {
                let foundDB = false;
                let schemaList = [];
                schemaRows.forEach(schemaRow => {
                    if (DB.DBtype === schemaRow.DBtype
                        && DBlistItem.DBserver === schemaRow.DBserver
                        && DBlistItem.targetDB === schemaRow.targetDB) {
                        if (!foundDB) {
                            schemaObjs.push({
                                DBtype: schemaRow.DBtype,
                                DBserver: schemaRow.DBserver,
                                targetDB: schemaRow.targetDB,
                                schemaList: schemaList,
                                DBstr: schemaRow.DBstr
                            });
                            foundDB = true;
                        }
                        schemaList.push(schemaRow.schema);
                    }
                })
            });
            if (schemaObjs.length > 0) {
                schemaLocal.push(...schemaObjs);
                //console.log(...schemaLocal);
            }
        }) */
    } catch (error) {
        console.error(error);
        retVal = false;
    } finally {
        return { retVal: retVal, retObj: new Array(...linksLocal) };
    }
}
async function getSchemaLinks(DBconnection) {
    let fnStr = fileStr + "::getSchemaLinks";
    console.log(fnStr + ": Entered ...");

    const sch_link_sql_1 = `SELECT DBtype, DBserver, targetDB, schema, subject, tableName, schema_id `;
    const sch_link_sql_2 = `, DBserver || '.' || targetDB || '.' || schema AS schemaStr `;
    const sch_link_sql_3 = `, '[' || DBtype || ']' || ' ' || DBserver || '.' || targetDB AS DBstr `;
    const sch_link_sql_4 = `FROM schema_links ORDER BY DBtype, DBserver, targetDB, schema `;
    const sch_link_sql = sch_link_sql_1 + sch_link_sql_2 + sch_link_sql_3 + sch_link_sql_4;

    let schemaLinksLocal = [];
    let retVal = true;

    try {
        const schemaLinkRows = await DBread(DBconnection, sch_link_sql);
        //console.log(fnStr + ": Logging schemaLinkRows " + schemaLinkRows);

        if (schemaLinkRows.length > 0) { schemaLinksLocal.push(...schemaLinkRows); }
        /* schema.forEach(sch => {
            //console.log(fnStr + ": Logging sch " + sch);
            let schemaLinkObjs = [];
            sch.schemaList.forEach(schListItem => {
                //console.log(fnStr + ": Logging schListItem " + schListItem);
                let linksList = [];
                let foundSchemaLink = false;
                schLinkRows.forEach(schLinkRow => {
                    //console.log(fnStr + ": Logging subjTblRow " + subjTblRow);
                    if (sch.DBtype === schLinkRow.DBtype
                        && sch.targetDB === schLinkRow.targetDB
                        && sch.DBserver === schLinkRow.DBserver
                        && schListItem === schLinkRow.schema) {
                        if (!foundSchemaLink) {
                            schemaLinkObjs.push({
                                DBtype: schLinkRow.DBtype,
                                DBserver: schLinkRow.DBserver,
                                targetDB: schLinkRow.targetDB,
                                schema: schLinkRow.schema,
                                linksList: linksList,
                                DBstr: schLinkRow.DBstr,
                                schemaStr: schLinkRow.schemaStr
                            });
                            foundSchemaLink = true;
                        }
                        linksList.push({ subject: schLinkRow.subject, tableName: schLinkRow.tableName });
                    }
                })
            })
            if (schemaLinkObjs.length > 0) {
                schemaLinksLocal.push(...schemaLinkObjs);
                //console.log(...linksLocal);
            }
        }) */
    } catch (error) {
        console.error(error); retVal = false;
    } finally {
        return { retVal: retVal, retObj: new Array(...schemaLinksLocal) }
    }
}

export function getDBdata(dataType) {
    let fnStr = fileStr + "::getDBdata";
    //console.log(fnStr + ": Entered ...");

    if (dataType === 'schema') {
        //console.log(fnStr + ": Schemas requested");
        return schema;
    }
    else if (dataType === 'schemaLinks') {
        //console.log(fnStr + ": links requested.");
        return schemaLinks;
    }
    if (dataType === 'links') {
        //console.log(fnStr + ": Links requested");
        return links;
    }
    else if (dataType === 'targetDBs') {
        //console.log(fnStr + ": Databases requested.");
        return DBs;
    }
    else if (dataType === 'DBtypes') {
        //console.log(fnStr + ": Database types requested.");
        return DBtypes;
    }
    else {
        //console.error(fnStr + ": Unknown data type.");
        return NaN;
    }
};
