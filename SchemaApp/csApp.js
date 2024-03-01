import express, { json, urlencoded } from 'express';
//import createError from 'http-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { dataFromDB, createLink, createSchema } from './ViewProcessor.js';

var csApp = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileStr = __filename.replace(__dirname, '');

csApp.use(cors());
csApp.use(logger('dev'));
csApp.use(json());
csApp.use(urlencoded({ extended: false }));
csApp.use(cookieParser());
csApp.use(express.static(join(__dirname, 'public')));

// error handler
/* csApp.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //res.render('error');
    //res.send('error');
}); */

csApp.get('/', function (req, res) {
    console.log("GET request for the homepage");
    let DBretVal = dataFromDB();
    if (!DBretVal.retVal) {
        let msgStr = ": Error getting DB data.";
        console.error(fileStr + msgStr);
        res.status(500).send(fileStr + msgStr);
    } else {
        let resBody = {
            'DBtypes': DBretVal.DBtypes,
            'DBs': DBretVal.DBs,
            'schema': DBretVal.schema,
            'subjectTables': DBretVal.subjectTables
        };
        res.status(200).send(resBody);
    }
});

csApp.get('/subjectList', function (req, res) {
    console.log(fileStr + ": GET request for subjectList");
    let DBretVal = dataFromDB();
    //console.log(DBretVal);
    if (!DBretVal.retVal) {
        let msgStr = ": Error getting DB data.";
        console.error(fileStr + msgStr);
        res.status(500).send(fileStr + msgStr);
    } else {
        let resBody = {
            'DBtypes': DBretVal.DBtypes,
            'DBs': DBretVal.DBs,
            'schema': DBretVal.schema,
            'links': DBretVal.links,
            'schemaLinks': DBretVal.schemaLinks,
            'message': "Database values received."
        };
        res.send(resBody);
    }
});

csApp.post('/createLink', async function (req, res) {
    console.log(fileStr + ": POST request for createLink");
    const DBtype = req.body.DBtype;
    const DBserver = req.body.DBserver;
    const targetDB = req.body.targetDB;
    const schema = req.body.schema;
    const subject = req.body.subject;
    const tableName = req.body.tableName;
    let retVal = await createLink(DBtype, DBserver, targetDB, schema, subject, tableName);
    if (!retVal) {
        res.status(500).send({ 'message': "Error inserting link." })
    }
    res.send({ 'message': 'Link created.' });
});

csApp.post('/createSchema', async function (req, res) {
    console.log(fileStr + ": Got a POST request for createSchema");
    const DBtype = req.body.DBtype;
    const DBserver = req.body.DBserver;
    const DB = req.body.targetDB;
    const schema = req.body.schema;
    let retVal = await createSchema(DBtype, DBserver, DB, schema);
    if (!retVal) {
        res.status(500).send({ 'message': "Error inserting message." })
    }
    res.send({ 'message': 'Schema created.' });
});

/* csApp.post('/subjectList', function (req, res) {
    console.log(fileStr + ": Got a POST request for subjectList");
    const DBtype = req.query.DBtype;
    const DBserver = req.query.DBserver;
    const DB = req.query.DB;
    let DBretVal = dataFromDB(DBtype, DBserver, DB);
    //console.log(retVal.DBs);
    if (DBretVal.retVal) {
        const resBody = {
            'DBtypes': DBretVal.DBtypes,
            'DBs': DBretVal.DBs,
            'schema': DBretVal.schema,
            'subjectTables': DBretVal.subjectTables
        };
        res.send(resBody);
    } else {
        res.status(500).send("Error getting DB data.");
    }
}); */

export default csApp;
