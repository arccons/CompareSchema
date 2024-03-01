import os

if os.getenv('DB_TYPE') == 'mssql':
    import SchemaCheck.src.MSsql as DB
if os.getenv('DB_TYPE') == 'pgsql':
    import SchemaCheck.src.PGsql as DB
if os.getenv('DB_TYPE') == 'sqlite':
    import SchemaCheck.src.SQLITEsql as DB

fileStr = f"{__file__.strip(os.getcwd())}"

def typeMatrix():
    return DB.typeMatrix

def checkTable(schema, tableName):
    fnStr = fileStr + "::getTable"
    cursor, DBconn = DB.connect_to_DB()
    #cursor = DBobjects["cursor"]
    cursor.execute(DB.getTableSQL(schema, tableName))
    tableList = cursor.fetchall()
    DB.closeConnection(DBconn)
    if len(tableList) != 1:
        msgStr = f"{fnStr}: Error accessing table."
        return False, msgStr, None
    else:
        msgStr = f"{fnStr}: Found table."
        return True, msgStr

def getTableColumns(schema, tableName):
    fnStr = fileStr + "::getTableColumns"
    cursor, DBconn = DB.connect_to_DB()
    #cursor = DBobjects['cursor']
    cursor.execute(DB.getTableColumnsSQL(schema, tableName))
    tableColList = cursor.fetchall()
    DB.closeConnection(DBconn)
    if len(tableColList) == 0:
        msgStr = f"{fnStr}: Error accessing table columns."
        return False, msgStr, None
    else:
        msgStr = f"{fnStr}: Found table columns."
        return True, msgStr, tableColList
""" 
def compareColumns(fileDtypes, tableCols):
    fnStr = fileStr + "::compareColumns"
    printStr = f"{fnStr}: Comparing file types - \n{fileDtypes} with table columns \n{tableCols}"
    print(printStr)
    if len(fileDtypes) != len(tableCols):
        msgStr = f"{fnStr}: Number of file columns do not match number of table columns."
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
            msgStr = f"{fnStr}: File column {fileType} at position {i+1} does not match any type."
            print(msgStr)
            return False, msgStr
        i=i+1

    msgStr = f"{fnStr}: File format matches table schema."
    return True, msgStr

def getSubjectList():
    fnStr = fileStr + "::getSubjectList"
    cursor, DBconn = DB.connect_to_DB()
    cursor.execute(DB.getSubjectListSQL())  
    rowList = cursor.fetchall()
    DB.closeConnection(DBconn)
    lenRowList = len(rowList)
    if lenRowList > 0:
        msgStr = f"{fnStr}: {lenRowList} subjects found."
        return True, msgStr, rowList
    else: # TODO: Check for initial load?
        msgStr = f"{fnStr}: Error finding subject."
        return False, msgStr, None """

def createLink(server_db_schema, tableName, subject):
    fnStr = fileStr + "::createLink"
    msgStr = f"{fnStr}: Checking subject in schema."
    cursor, DBconn = DB.connect_to_DB()
    #cursor = DBobjects['cursor']
    cursor.execute(DB.checkLinkSubjectSQL(server_db_schema, subject))
    subjectCount = cursor.fetchall()
    prtStr = f"{fnStr}: Subject count: {subjectCount}"
    print(prtStr)
    if subjectCount[0][0] != 0:
        DB.closeConnection(DBconn)
        msgStr = f"{fnStr}: Subject already exists in schema {server_db_schema}"
        return False, msgStr
    cursor.execute(DB.checkLinkTableSQL(server_db_schema, tableName))
    tableCount = cursor.fetchall()
    prtStr = f"{fnStr}: Table count: {tableCount}"
    print(prtStr)
    if tableCount[0][0] == 0:
        DB.closeConnection(DBconn)
        msgStr = f"{fnStr}: Table does not exist in schema {server_db_schema}"
        return False, msgStr
    
    msgStr = f"{fnStr}: Link is ready to be saved."
    print(msgStr)
    cursor.execute(DB.createLinkSQL(server_db_schema, tableName, subject))
    DB.commitConnection(DBconn)
    DB.closeConnection(DBconn)
    msgStr = f"{fnStr}: Schema-Table-Subject link created."
    return True, msgStr

def checkSubject(subject):
    fnStr = fileStr + "::checkSubject"
    cursor, DBconn = DB.connect_to_DB()
    #cursor = DBobjects['cursor']
    cursor.execute(DB.checkSubjectSQL(subject))
    row = cursor.fetchall()
    DB.closeConnection(DBconn)
    if row[0][0] != 1:
        msgStr = f"{fnStr}: Problem accessing subject."
        return False, msgStr
    else:
        msgStr = f"{fnStr}: Found subject."
        return True, msgStr
