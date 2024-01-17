import os

if os.getenv('DB') == 'mssql':
    import SchemaCheck.src.MSsql as DB
if os.getenv('DB') == 'pgsql':
    import SchemaCheck.src.PGsql as DB

def getSubjectList():
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    cursor.execute(DB.getSubjectListSQL())  
    rowList = cursor.fetchall()
    return rowList

def checkSubject(subject):
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    cursor.execute(DB.checkSubjectSQL(subject))
    row = cursor.fetchall()
    if row[0][0] != 1:
        return False
    return True

def getTable(subject):
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    cursor.execute(DB.getTableSQL(subject))
    rowList = cursor.fetchall()
    return rowList

def getTableColumns(table):
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    cursor.execute(DB.getTableColumnsSQL(table))
    col_list = cursor.fetchall()
    #print(f"Table columns = {col_list}")
    return col_list

def createSubjectBase(tableName, subject):
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    stgTableName = f"{tableName}_STG"
    #print(f"Staging table name = {stgTableName}")
    cursor.execute(DB.createSubjectSQL(tableName, subject))
    cursor.execute(DB.createTableSQL(tableName))
    cursor.execute(DB.createStagingTableSQL(stgTableName))
    DB.commitCursor(DBobjects[1])
    return True

def addStringColumn(table, colName):
    DBobjects = DB.connect_to_DB()
    cur = DBobjects[0]
    #print(f"Table = {table}; Column = {colName}; Type = String")
    cur.execute(DB.addStringColumnSQL(table, colName))
    cur.execute(DB.addStringColumnSQL(table+'_STG', colName))
    DB.commitCursor(DBobjects[1])
    return True

def addFloatColumn(table, colName):
    DBobjects = DB.connect_to_DB()
    cur = DBobjects[0]
    #print(f"Table = {table}; Column = {colName}; Type = Float")
    cur.execute(DB.addFloatColumnSQL(table, colName))
    cur.execute(DB.addFloatColumnSQL(table+'_STG', colName))
    DB.commitCursor(DBobjects[1])
    return True

def addIntColumn(table, colName):
    DBobjects = DB.connect_to_DB()
    cur = DBobjects[0]
    #print(f"Table = {table}; Column = {colName}; Type = Integer")
    cur.execute(DB.addIntColumnSQL(table, colName))
    cur.execute(DB.addIntColumnSQL(table+'_STG', colName))
    DB.commitCursor(DBobjects[1])
    return True

def addBoolColumn(table, colName):
    DBobjects = DB.connect_to_DB()
    cur = DBobjects[0]
    #print(f"Table = {table}; Column = {colName}; Type = Boolean")
    cur.execute(DB.addBoolColumnSQL(table, colName))
    cur.execute(DB.addBoolColumnSQL(table+'_STG', colName))
    DB.commitCursor(DBobjects[1])
    return True

def addDateColumn(table, colName):
    DBobjects = DB.connect_to_DB()
    cur = DBobjects[0]
    #print(f"Table = {table}; Column = {colName}; Type = Date")
    cur.execute(DB.addDateColumnSQL(table, colName))
    cur.execute(DB.addDateColumnSQL(table+'_STG', colName))
    DB.commitCursor(DBobjects[1])
    return True

def addRecords(table, tableColList, recordValList):
    DBobjects = DB.connect_to_DB()
    cur = DBobjects[0]
    #print(type(tableColList), tableColList)
    for recordVal in recordValList:
        cur.execute(DB.addRecordSQL(table, tableColList, recordVal))
    DB.commitCursor(DBobjects[1])
    return True
