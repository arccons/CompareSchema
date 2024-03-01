import os
import pandas
import SchemaCheck.src.DBpkg as DBpkg

fileStr = f"{__file__.strip(os.getcwd())}"

def processUploadedFile(fileDF, uploadedFile, fileType):
    fnStr = fileStr + "::processUploadedFile"
    if fileType == 'text/csv':
        fileDF = pandas.read_csv(uploadedFile, date_format="%Y-%m-%d").dropna(how='all')
    else:
        fileDF = pandas.read_excel(uploadedFile)
    
    if fileDF.empty:
        msgStr = f"{fnStr}: fileDF empty after read."
        print(msgStr)
        return False, msgStr, None

    msgStr = f"{fnStr}: fileDF before type change - \n{fileDF.dtypes}"
    print(msgStr)
    # First remove all NULLs
    fileDF = fileDF.apply(lambda col: pandas.Series.ffill(col, inplace=True, axis=0)
                          if pandas.Series.isnull(col).all()
                          else col,
                          axis=0)
    msgStr = f"{fnStr}: fileDF after NULL type change - \n{fileDF.dtypes}"
    print(msgStr)
    # Then convert datetime columns
    fileDF = fileDF.apply(lambda col: pandas.to_datetime(col, errors='ignore')
            if col.dtypes == object 
            else col, 
            axis=0)
    msgStr = f"{fnStr}: fileDF after TO_DATETIME type change - \n{fileDF.dtypes}"
    print(msgStr)
    # Then convert string columns
    fileDF = fileDF.apply(lambda col: pandas.Series(col.astype('string'))
            if col.dtypes == object 
            else col, 
            axis=0)
    msgStr = f"{fnStr}: fileDF after STRING type change - \n{fileDF.dtypes}"
    print(msgStr)

    if fileDF.empty:
        msgStr = f"{fnStr}: fileDF empty after type change."
        print(msgStr)
        return False, msgStr, None
    else:
        msgStr = f"{fnStr}: File processed into DataFrame."
        print(msgStr)
        return True, msgStr, fileDF

def compareColumns(fileDF, schema, tableName):
    fnStr = fileStr + "::compareSchema"
    tableReturn, errStr = DBpkg.checkTable(schema, tableName)
    if not tableReturn:
        print(errStr)
        msgStr = f"{fnStr}: Table not found - {errStr}"
        print(msgStr)
        return False, msgStr

    """ tableSchema, table = list(tableList)[0]
    msgStr = f"{fnStr}: Table - {tableSchema}.{table}"
    print(msgStr) """

    colListReturn, errStr, tableCols = DBpkg.getTableColumns(schema, tableName)
    if not colListReturn:
        print(errStr)
        msgStr = f"{fnStr}: Table columns not found."
        print(msgStr)
        return False, msgStr
    fileDtypes = fileDF.dtypes
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
        for typeDict in DBpkg.typeMatrix():
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

"""     tableCols = list(colList)
    compareReturn = DBpkg.compareColumns(fileDtypes=fileDF.dtypes, tableCols=tableCols)
    if not compareReturn:
        msgStr = f"{fnStr}: Table columns do not match file columns."
        print(msgStr)
        return False, msgStr
    else:
        msgStr = f"{fnStr}: Table columns match file columns."
        print(msgStr)
        return True, msgStr
 """
def createLink(tableName, subject, server_db_schema):
    fnStr = f"{fileStr}::createLink"
    retStr = f"{fnStr}: Not implemented."
    return False, retStr

""" def createSchema(server, DB, schema):
    fnStr = f"{fileStr}::createSchema"
    retStr = f"{fnStr}: Not implemented."
    return False, retStr """
