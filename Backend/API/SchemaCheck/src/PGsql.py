import os
import psycopg

typeMatrix = [{'int64': ['integer', 'bigint', 'smallint']}, 
              {'float64': ['double precision', 'numeric', 'decimal', 'real', 'integer']}, #integer OTs 
              {'string': ['character varying', 'character', 'varchar', 'xml', 'uuid']}, #uuid OTs
              {'bool': ['bit', 'bit varying', 'boolean', 'char', ]}, 
              {'datetime64[ns]': ['date', 'interval', 'time with time zone', 
                'time without time zone', 'timestamp with time zone', 
                'timestamp without time zone']}
            ]

fileStr = f"{__file__.strip(os.getcwd())}"

def connect_to_DB():
    #print(DB_DRIVER, DB_HOST, DATABASE, TRUSTED_CONNECTION)
    DBconn = psycopg.connect(host=os.getenv('PGSQL_DB_HOST'), port=os.getenv('PGSQL_PORT'), dbname=os.getenv('PGSQL_DATABASE'), user=os.getenv('PGSQL_USER'), password=os.getenv('PGSQL_PASSWD'))
    #host=localhost, port=5432, dbname=SchemaCheck, user=postgres, password=xxxxxxx 
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

def checkLinkSubjectSQL(server_db_schema, subject):
    whereString = f"LOWER(server_db_schema) = '{server_db_schema.lower()}' AND LOWER(subject) = '{subject.lower()}'"
    sql_stmt = f"SELECT COUNT(*) FROM public.subjects_temp WHERE {whereString}"
    print(f"{fileStr}::checkLinkSubjectSQL: {sql_stmt}")
    return sql_stmt

""" PGSQL_DB_HOST='localhost' #Admin option
PGSQL_DATABASE='AdventureWorks' #Admin option
PGSQL_DB_SCHEMA='public' #Admin option """

def checkLinkTableSQL(server_db_schema, tableName):
    print(f"{fileStr}::checkTableLinkSQL: server_db_schema = {server_db_schema}")
    tab_str1 = server_db_schema.replace(os.getenv('PGSQL_DB_HOST'), '')
    tab_str2 = tab_str1.replace(os.getenv('PGSQL_DATABASE'), '')
    tab_str = tab_str2.replace('.', '')
    print(f"{fileStr}::checkTableLinkSQL: tab_str= {tab_str}")
    whereString = f"table_catalog = '{os.getenv('PGSQL_DATABASE')}' AND table_schema = '{tab_str}' AND LOWER(table_name)='{tableName.lower()}'"
    sql_stmt = f"SELECT COUNT(*) FROM INFORMATION_SCHEMA.tables WHERE {whereString}"
    print(f"{fileStr}::checkLinkTableSQL: {sql_stmt}")
    return sql_stmt

def createLinkSQL(server_db_schema, tableName, subject):
    valString = f"gen_random_uuid(), '{server_db_schema}', '{subject}', '{tableName}'"
    sql_stmt = f"INSERT INTO public.subjects_temp (subject_id, server_db_schema, subject, table_name) VALUES ({valString})"
    print(f"{fileStr}::checkLinkSQL: {sql_stmt}")
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

""" 
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

def addRecordSQL(table, tableColList, recordVals, allowBlanks):
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
 """