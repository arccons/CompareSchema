import os
import pyodbc
from datetime import datetime

default_schema = f"{os.getenv('MSSQL_DB_HOST')}.{os.getenv('MSSQL_DATABASE')}.{os.getenv('MSSQL_DB_SCHEMA')}"

typeMatrix = [{'int64': ['integer', 'bigint', 'smallint']}, 
              {'float64': ['double precision', 'numeric', 'decimal', 'real', 'integer']}, #integer OTs 
              {'string': ['character varying', 'character', 'varchar', 'xml', 'uuid']}, #uuid OTs
              {'bool': ['bit', 'bit varying', 'boolean', 'char', ]}, 
              {'datetime64[ns]': ['date', 'interval', 'time with time zone', 
                'time without time zone', 'timestamp with time zone', 
                'timestamp without time zone']}
            ]

def connect_to_DB():
    #print(DB_DRIVER, DB_HOST, DATABASE, TRUSTED_CONNECTION)
    #DBconn = pyodbc.connect(driver='{SQL Server}', server='DESKTOP-ALT0UH5', database='SchemaCheck', trusted_connection='yes')
    DBconn = pyodbc.connect(driver=os.getenv('MSSQL_DB_DRIVER'), server=os.getenv('MSSQL_DB_HOST'), database=os.getenv('MSSQL_DATABASE'), trusted_connection=os.getenv('MSSQL_TRUSTED_CONNECTION'))
    cursor = DBconn.cursor()
    return [cursor, DBconn]

def closeConnection(DBconn):
    DBconn.close()

def commitConnection(DBconn):
    DBconn.commit()

def getSubjectListSQL():
    sql_stmt = "SELECT DISTINCT SUBJECT, TABLE_NAME from SchemaCheck.dbo.SUBJECTS"
    #print(f"Subject List SQL = {sql_stmt}")
    return sql_stmt

def checkSubjectSQL(subject):
    sql_stmt = f"SELECT COUNT(*) from SchemaCheck.dbo.SUBJECTS st where st.SUBJECT = '{subject}'"
    #print(f"Subject SQL = {sql_stmt}")
    return sql_stmt

def getTableSQL(subject):
    sql_stmt = f"SELECT st.TABLE_NAME from SchemaCheck.dbo.SUBJECTS st where st.SUBJECT = '{subject}'"
    #print(f"Table SQL = {sql_stmt}")
    return sql_stmt

def getTableColumnsSQL(table):
    sql_stmt = f"SELECT column_name from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = '{table}' ORDER BY ORDINAL_POSITION"
    #print(f"Column List SQL = {sql_stmt}")
    return sql_stmt

def createSubjectSQL(tableName, subject):
    valString = f"NEWID(), '{subject}', '{tableName}'"
    sql_stmt = f"INSERT INTO SchemaCheck.dbo.SUBJECTS (ID, SUBJECT, TABLE_NAME) VALUES ({valString})"
    #print(f"New SUBJECT SQL = {sql_stmt}")
    return sql_stmt

def createTableSQL(tableName):
    sql_stmt = f"CREATE TABLE SchemaCheck.dbo.{tableName} ([ID] [uniqueidentifier] NOT NULL, [LOAD_TIMESTAMP] [timestamp] NOT NULL)"
    #print(f"New Subject Table SQL = {sql_stmt}")
    return sql_stmt

def createStagingTableSQL(tableName):
    sql_stmt = f"CREATE TABLE SchemaCheck.dbo.{tableName} ([ID] [uniqueidentifier] NOT NULL, [STATUS] [char](10) NOT NULL DEFAULT('LOADED'), [STATUSTIMESTAMP] [timestamp] NOT NULL)"
    #print(f"New Staging Table SQL = {sql_stmt}")
    return sql_stmt

def addStringColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE SchemaCheck.dbo.{table} ADD {colName} varchar(255)"
    #print(f"New String Column SQL = {sql_stmt}")
    return sql_stmt

def addFloatColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE SchemaCheck.dbo.{table} ADD {colName} float"
    #print(f"New Float Column SQL = {sql_stmt}")
    return sql_stmt

def addIntColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE SchemaCheck.dbo.{table} ADD {colName} numeric"
    #print(f"Add Int column SQL = {sql_stmt}")
    return sql_stmt

def addBoolColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE SchemaCheck.dbo.{table} ADD {colName} bit"
    #print(f"Add Boolean column SQL = {sql_stmt}")
    return sql_stmt

def addDateColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE SchemaCheck.dbo.{table} ADD {colName} date"
    #print(f"Add column SQL = {sql_stmt}")
    return sql_stmt

def addRecordSQL(table, tableColList, recordVals, allowBlanks):
    colString = 'ID, ' + ', '.join(tableColList)
    valString = f"NEWID()"

    for i in range(len(recordVals)):
        itemString = ""

        isBool = False
        if recordVals[i] in (True, False):
            itemString = str(1) if recordVals[i] else str(0)
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
        #print(f"Column string = {colString}; Value string = {valString}")
    sql_stmt = f"INSERT INTO SchemaCheck.dbo.{table} ({colString}) VALUES({valString})"
    #print(f"Add record - {table} : {valString}")
    return sql_stmt
