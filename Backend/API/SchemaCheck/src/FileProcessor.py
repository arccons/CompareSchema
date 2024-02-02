import os
import pandas
import SchemaCheck.src.DBpkg as DBpkg

#default_schema = DBpkg.default_schema
fileStr = f"{__file__.strip(os.getcwd())}"

def getSubjectList(subjectDF):
    #msgStr = f"{fileStr}::getSubjectList: Entered."
    #print(msgStr)
    returnVal, retStr, rowList = DBpkg.getSubjectList()
    if not returnVal:
        print(retStr)
        msgStr = f"{fileStr}::getSubjectList: Error finding subjects."
        print(msgStr)
        return False, msgStr, None

    lenRowList = len(rowList)
    msgStr = f"{fileStr}::getSubjectList: {lenRowList} subjects found."
    print(msgStr)
    for row in rowList:
        print(f"{row[1:]}")
    subjectDF = pandas.DataFrame.from_records(rowList, columns=['SUBJECT_ID', 'SERVER_DB_SCHEMA', 'TABLE_NAME', 'SUBJECT'])
    return True, msgStr, subjectDF

def createSchema(server, DB, schema):
    retStr = f"{fileStr}::createSchema: Not implemented."
    return False, retStr

def createLink(tableName, subject, server_db_schema):
    return DBpkg.createLink(server_db_schema = server_db_schema, 
                            tableName = tableName, 
                            subject = subject)

def processUploadedFile(fileDF, uploadedFile, fileType, subject, subjectID):
    if fileType == 'text/csv':
        fileDF = pandas.read_csv(uploadedFile, 
                                 date_format="%Y-%m-%d",
                                ).dropna(how='all')
    else:
        fileDF = pandas.read_excel(uploadedFile)
    emptyAfterRead = fileDF.empty
    if emptyAfterRead:
        msgStr = f"{fileStr}::processUploadedFile: fileDF empty after read."
        print(msgStr)
        return False, msgStr, None

    msgStr = f"FP.py::processUploadedFile: fileDF before type change - \n{fileDF.dtypes}"
    print(msgStr)
    # First remove all NULLs
    fileDF = fileDF.apply(lambda col: pandas.Series.ffill(col, inplace=True, axis=0)
                          if pandas.Series.isnull(col).all()
                          else col,
                          axis=0)
    msgStr = f"FP.py::processUploadedFile: fileDF after NULL type change - \n{fileDF.dtypes}"
    print(msgStr)
    # Then convert datetime columns
    fileDF = fileDF.apply(lambda col: pandas.to_datetime(col, errors='ignore')
            if col.dtypes == object 
            else col, 
            axis=0)
    msgStr = f"FP.py::processUploadedFile: fileDF after TO_DATETIME type change - \n{fileDF.dtypes}"
    print(msgStr)
    # Then convert string columns
    fileDF = fileDF.apply(lambda col: pandas.Series(col.astype('string'))
            if col.dtypes == object 
            else col, 
            axis=0)
    msgStr = f"FP.py::processUploadedFile: fileDF after STRING type change - \n{fileDF.dtypes}"
    print(msgStr)

    if fileDF.empty:
        msgStr = f"{fileStr}::processUploadedFile: fileDF empty after type change."
        print(msgStr)
        return False, msgStr, None
    else:
        msgStr = f"{fileStr}::processUploadedFile: File processed into DataFrame."
        print(msgStr)
        return True, msgStr, fileDF

def compareWithTable(fileDF, subject, subjectID=None):
    #TODO: Use subjectID instead of subject
    tableReturn, errStr, tableList = DBpkg.getTable(subject)
    if not tableReturn:
        print(errStr)
        msgStr = f"{fileStr}::compareWithTable: Table not found."
        print(msgStr)
        return False, msgStr

    tableSchema, table = list(tableList)[0]
    msgStr = f"{fileStr}::compareWithTable: Table - {tableSchema}.{table}"
    print(msgStr)

    colListReturn, errStr, colList = DBpkg.getTableColumns(table)
    if not colListReturn:
        print(errStr)
        msgStr = f"{fileStr}::compareWithTable: Table columns not found."
        print(msgStr)
        return False, msgStr

    tableCols = list(colList)
    compareReturn = DBpkg.compareColumns(fileDtypes=fileDF.dtypes, tableCols=tableCols)
    if not compareReturn:
        msgStr = f"{fileStr}::compareWithTable: Table columns do not match file columns."
        print(msgStr)
        return False, msgStr
    else:
        msgStr = f"{fileStr}::compareWithTable: Table columns match file columns."
        print(msgStr)
        return True, msgStr
