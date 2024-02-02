import os
import sqlite3

print(f"NEED TO FIX SQLite FILE PATH")

default_schema = f"{os.getenv('PGSQL_DB_HOST')}.{os.getenv('PGSQL_DATABASE')}.{os.getenv('PGSQL_DB_SCHEMA')}"

typeMatrix = [{'int64': ['integer', 'bigint', 'smallint']}, 
              {'float64': ['double precision', 'numeric', 'decimal', 'real', 'integer']}, #integer OTs 
              {'string': ['character varying', 'character', 'varchar', 'xml', 'uuid']}, #uuid OTs
              {'bool': ['bit', 'bit varying', 'boolean', 'char', ]}, 
              {'datetime64[ns]': ['date', 'interval', 'time with time zone', 
                'time without time zone', 'timestamp with time zone', 
                'timestamp without time zone']}
            ]

def connect_to_DB():
    DBconn = sqlite3.connect(os.getenv("SQLITE_FILE"))
    cursor = DBconn.cursor()
    return [cursor, DBconn]

def closeConnection(DBconn):
    DBconn.close()

def commitConnection(DBconn):
    DBconn.commit()

def getSubjectListSQL():
    sql_stmt = f"SELECT DISTINCT subject_id, SERVER_DB_SCHEMA, TABLE_NAME, SUBJECT from subjects_temp"
    #print(f"Subject List SQL = {sql_stmt}")
    return sql_stmt

def createLinkSQL(server_db_schema, tableName, subject, allowBlanks):
    sql_stmt = f"INSERT INTO subjects_temp (server_db_schema, table_name, subject) VALUES ('{server_db_schema}', '{tableName}', '{subject}')"
    #print(f"Link SQL = {sql_stmt}")
    return sql_stmt

def checkSubjectSQL(subject):
    sql_stmt = f"SELECT COUNT(*) from subjects_temp st where st.SUBJECT = '{subject}'"
    #print(f"Subject SQL = {sql_stmt}")
    return sql_stmt

def getTableSQL(subject):
    sql_stmt = f"SELECT server_DB_schema, table_name from subjects_temp where subject = '{subject}'"
    #print(f"Table SQL = {sql_stmt}")
    return sql_stmt

def getTableColumnsSQL(table):
    sql_stmt = f"SELECT ordinal_position, column_name, data_type from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = '{table}' ORDER BY ORDINAL_POSITION"
    #print(f"Column List SQL = {sql_stmt}")
    return sql_stmt

""""
def createSchemaSQL(schemaName):
    valString = f"'{schemaName}', 'For {schemaName}'"
    sql_stmt = f"INSERT INTO subjects (subject_name, subject_desc, subject_display) VALUES ({valString})"
    print(f"New SUBJECT SQL = {sql_stmt}")
    return sql_stmt

def createSubjectSQL(schemaName, tableName, subject):
    valString = f"'{subject}', 'For  {schemaName}.{tableName}', '{subject}'"
    sql_stmt = f"INSERT INTO subjects (subject_name, subject_desc, subject_display) VALUES ({valString})"
    print(f"New SUBJECT SQL = {sql_stmt}")
    return sql_stmt

def createTableSQL(tableName):
    sql_stmt = f"CREATE TABLE {tableName} ([ID] [uniqueidentifier] NOT NULL, [LOAD_TIMESTAMP] [timestamp] NOT NULL)"
    #print(f"New Subject Table SQL = {sql_stmt}")
    return sql_stmt

def createStagingTableSQL(tableName):
    sql_stmt = f"CREATE TABLE {tableName} ([ID] [uniqueidentifier] NOT NULL, [STATUS] [char](10) NOT NULL DEFAULT('LOADED'), [STATUSTIMESTAMP] [timestamp] NOT NULL)"
    #print(f"New Staging Table SQL = {sql_stmt}")
    return sql_stmt

def addStringColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE {table} ADD {colName} varchar(255)"
    #print(f"New String Column SQL = {sql_stmt}")
    return sql_stmt

def addFloatColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE {table} ADD {colName} float"
    #print(f"New Float Column SQL = {sql_stmt}")
    return sql_stmt

def addIntColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE {table} ADD {colName} numeric"
    #print(f"Add Int column SQL = {sql_stmt}")
    return sql_stmt

def addBoolColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE {table} ADD {colName} bit"
    #print(f"Add Boolean column SQL = {sql_stmt}")
    return sql_stmt

def addDateColumnSQL(table, colName):
    sql_stmt = f"ALTER TABLE {table} ADD {colName} date"
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
    sql_stmt = f"INSERT INTO {table} ({colString}) VALUES({valString})"
    #print(f"Add record - {table} : {valString}")
    return sql_stmt
 """
