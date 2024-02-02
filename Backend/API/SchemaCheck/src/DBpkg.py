import os

if os.getenv('DB_TYPE') == 'mssql':
    import SchemaCheck.src.MSsql as DB
if os.getenv('DB_TYPE') == 'pgsql':
    import SchemaCheck.src.PGsql as DB
if os.getenv('DB_TYPE') == 'sqlite':
    import SchemaCheck.src.SQLITEsql as DB

#default_schema = DB.default_schema
fileStr = f"{__file__.strip(os.getcwd())}"

def getSubjectList():
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    #sql_stmt = DB.getSubjectListSQL()
    #cursor.execute(sql_stmt)
    cursor.execute(DB.getSubjectListSQL())  
    rowList = cursor.fetchall()
    DB.closeConnection(DBobjects[1])
    lenRowList = len(rowList)
    if lenRowList > 0:
        msgStr = f"{fileStr}::getSubjectList: {lenRowList} subjects found."
        return True, msgStr, rowList
    else: # TODO: Check for initial load?
        msgStr = f"{fileStr}::getSubjectList: Error finding subject."
        return False, msgStr, None

def createLink(server_db_schema, tableName, subject):
    msgStr = f"{fileStr}::checkLink: Checking subject in schema."
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    cursor.execute(DB.checkLinkSubjectSQL(server_db_schema, subject))
    subjectCount = cursor.fetchall()
    prtStr = f"{fileStr}::checkLink: Subject count: {subjectCount}"
    print(prtStr)
    if subjectCount[0][0] != 0:
        DB.closeConnection(DBobjects[1])
        msgStr = f"{fileStr}::checkLink: Subject already exists in schema {server_db_schema}"
        return False, msgStr
    cursor.execute(DB.checkLinkTableSQL(server_db_schema, tableName))
    tableCount = cursor.fetchall()
    prtStr = f"{fileStr}::checkLink: Table count: {tableCount}"
    print(prtStr)
    if tableCount[0][0] == 0:
        DB.closeConnection(DBobjects[1])
        msgStr = f"{fileStr}::checkLink: Table does not exist in schema {server_db_schema}"
        return False, msgStr
    
    msgStr = f"{fileStr}::checkLink: Link is ready to be saved."
    print(msgStr)
    cursor.execute(DB.createLinkSQL(server_db_schema, tableName, subject))
    DB.commitConnection(DBobjects[1])
    DB.closeConnection(DBobjects[1])
    msgStr = f"{fileStr}::createLink: Schema-Table-Subject link created."
    return True, msgStr

def checkSubject(subject):
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    cursor.execute(DB.checkSubjectSQL(subject))
    row = cursor.fetchall()
    DB.closeConnection(DBobjects[1])
    if row[0][0] != 1:
        msgStr = f"{fileStr}::checkSubject: Problem accessing subject."
        return False, msgStr
    else:
        msgStr = f"{fileStr}::checkSubject: Found subject."
        return True, msgStr

def getTable(subject):
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    cursor.execute(DB.getTableSQL(subject))
    tableList = cursor.fetchall()
    DB.closeConnection(DBobjects[1])
    if len(tableList) != 1:
        msgStr = f"{fileStr}::getTable: Problem accessing table."
        return False, msgStr, None
    else:
        msgStr = f"{fileStr}::getTable: Found table."
        return True, msgStr, tableList

def getTableColumns(table):
    DBobjects = DB.connect_to_DB()
    cursor = DBobjects[0]
    cursor.execute(DB.getTableColumnsSQL(table))
    tableColList = cursor.fetchall()
    #print(f"Table columns = {col_list}")
    DB.closeConnection(DBobjects[1])
    if len(tableColList) == 0:
        msgStr = f"{fileStr}::getTableColumns: Problem accessing table columns."
        return False, msgStr, None
    else:
        msgStr = f"{fileStr}::getTableColumns: Found table columns."
        return True, msgStr, tableColList

def compareColumns(fileDtypes, tableCols):
    printStr = f"{fileStr}::compareColumns: Comparing file types - \n{fileDtypes} with table columns \n{tableCols}"
    print(printStr)
    if len(fileDtypes) != len(tableCols):
        msgStr = f"{fileStr}::compareColumns: Number of file columns do not match number of table columns."
        return False, msgStr
    i=0
    for fileType in fileDtypes:
        tableType = list(tableCols[i])[2]
        #prtStr = f"{fileStr}::compareColumns: A: Comparing {fileType} with {tableType}"
        #print(prtStr)
        matchFound = False
        for typeDict in DB.typeMatrix:
            #prtStr = f"{fileStr}::compareColumns: B: Checking {fileType} in {list(typeDict.keys())}"
            #print(prtStr)
            if fileType in list(typeDict.keys()):
                #prtStr = f"{fileStr}::compareColumns: C: Checking {tableType} in {typeDict[str(fileType)]}"
                #print(prtStr)
                if tableType in typeDict[str(fileType)]:
                    prtStr = f"{fileStr}::compareColumns: {fileType} -- {tableType}: Type match in column {i+1}"
                    print(prtStr)
                    matchFound = True
                    break
        if not matchFound:
            msgStr = f"{fileStr}::compareColumns: File column {fileType} at position {i+1} does not match any type."
            print(msgStr)
            return False, msgStr
        i=i+1

    msgStr = f"{fileStr}::compareColumns: File format matches table schema."
    return True, msgStr
