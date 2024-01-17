import os
import psycopg
from datetime import datetime

def connect_to_DB():
    #print(DB_DRIVER, DB_HOST, DATABASE, TRUSTED_CONNECTION)
    DBconn = psycopg.connect(host=os.getenv('PGSQL_DB_HOST'), port=os.getenv('PGSQL_PORT'), dbname=os.getenv('PGSQL_DATABASE'), user=os.getenv('PGSQL_USER'), password=os.getenv('PGSQL_PASSWD'))
    #host=localhost, port=5432, dbname=SchemaCheck, user=postgres, password=xxxxxxx 
    cursor = DBconn.cursor()
    return [cursor, DBconn]

def commitCursor(DBconn):
    DBconn.commit()

def getSubjectListSQL():
    sql_stmt = f"SELECT DISTINCT subject, table_name from public.subjects"
    #print(f"Subject List SQL = {sql_stmt}")
    return sql_stmt

def checkSubjectSQL(subject):
    #subj_str =f"'{subject}'"
    sql_stmt = f"SELECT COUNT(*) from public.subjects where subject = '{subject}'"
    #print(f"Subject SQL = {sql_stmt}")
    return sql_stmt

def getTableSQL(subject):
    #subj_str =f"'{subject}'"
    sql_stmt = f"SELECT table_name from public.subjects st where subject = '{subject}'"
    #print(f"Table SQL = {sql_stmt}")
    return sql_stmt

def getTableColumnsSQL(table):
    table_str = str.lower(table)
    sql_stmt = f"SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '{table_str}' ORDER BY ordinal_position"
    #print(f"Column List SQL = {sql_stmt}")
    return sql_stmt

def createSubjectSQL(tableName, subject):
    valString = f"gen_random_uuid(), '{subject}', '{tableName}'"
    sql_stmt = f"INSERT INTO public.subjects (id, subject, table_name) VALUES ({valString})"
    #print(f"New SUBJECT SQL = {sql_stmt}")
    return sql_stmt

def createTableSQL(tableName):
    sql_stmt = f"CREATE TABLE public.{tableName} (ID uuid NOT NULL, LOAD_TIMESTAMP timestamp NOT NULL)"
    #print(f"New Subject Table SQL = {sql_stmt}")
    return sql_stmt

def createStagingTableSQL(tableName):
    #loaded_str = f"'LOADED'"
    sql_stmt = f"CREATE TABLE public.{tableName} (ID uuid NOT NULL, STATUS varchar(50) NOT NULL DEFAULT('LOADED'), STATUSTIMESTAMP timestamp NOT NULL)"
    #print(f"New Staging Table SQL = {sql_stmt}")
    return sql_stmt

def addStringColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE public.{table} ADD {colName} varchar(255)"
    #print(f"New String Column SQL = {sql_stmt}")
    return sql_stmt

def addFloatColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE public.{table} ADD {colName} float"
    #print(f"New Float Column SQL = {sql_stmt}")
    return sql_stmt

def addIntColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE public.{table} ADD {colName} numeric"
    #print(f"Add Int column SQL = {sql_stmt}")
    return sql_stmt

def addBoolColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE public.{table} ADD {colName} boolean"
    #print(f"Add Boolean column SQL = {sql_stmt}")
    return sql_stmt

def addDateColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE public.{table} ADD {colName} date"
    #print(f"Add column SQL = {sql_stmt}")
    return sql_stmt

def addRecordSQL(table, tableColList, recordVals):
    colString = f"ID, STATUSTIMESTAMP, "
    colString += f', '.join(tableColList)
    #print(f"Table columns: {colString}")
    valString = f"gen_random_uuid(), LOCALTIMESTAMP"

    for i in range(len(recordVals)):
        itemString = ""

        isBool = False
        if isinstance(recordVals[i], bool):
            itemString = 'True' if recordVals[i] else 'False'
            isBool = True

        isDate = False
        if isinstance(recordVals[i], datetime):
            itemString = f"'{str(datetime.date(recordVals[i]))[0:10]}'"
            #print(f"Date string = {itemString}")
            isDate = True

        isString = False
        if isinstance(recordVals[i], str) and not isDate:
            itemString = f"'{recordVals[i]}'"
            isString = True

        if not isDate and not isString and not isBool:
            itemString = str(recordVals[i])

        valString = valString + ', ' + itemString
    sql_stmt = f"INSERT INTO public.{table} ({colString}) VALUES({valString})"
    print(f"Add record - {table} : {valString}")
    return sql_stmt
