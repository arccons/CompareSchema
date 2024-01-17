import pandas
import SchemaCheck.src.DBpkg as DBpkg

def checkSubject(subject):
    return DBpkg.checkSubject(subject)

def getSubjectList():
    return pandas.DataFrame.from_records(DBpkg.getSubjectList(), columns=['SUBJECT', 'TABLE_NAME'])

def createSubjectBase(fileDF, tableName, subject):
    tablesExist = DBpkg.createSubjectBase(tableName, subject)
    if not tablesExist:
        return False

    for col in fileDF.columns:
        colType = fileDF[col].dtypes
        if colType == 'float64':
            DBpkg.addFloatColumn(tableName, col)
        elif colType == 'int64':
            DBpkg.addIntColumn(tableName, col)
        elif colType == 'bool':
            DBpkg.addBoolColumn(tableName, col)
        elif colType == 'string':
            DBpkg.addStringColumn(tableName, col)
        elif colType == 'datetime64[ns]':
            DBpkg.addDateColumn(tableName, col)

    return True

def processUploadedFile(uploadedFile, fileType):
    fileDF = pandas.DataFrame()
    if fileType == 'text/csv':
        fileDF = pandas.read_csv(uploadedFile, parse_dates=True, dayfirst=True)
    else:
        fileDF = pandas.read_excel(uploadedFile)
    # First convert datetime columns
    fileDF = fileDF.apply(lambda col: pandas.to_datetime(col, dayfirst=True, errors='ignore') 
            if col.dtypes == object 
            else col, 
            axis=0)
    # Then convert string columns
    fileDF = fileDF.apply(lambda col: col.astype('string')
            if col.dtypes == object 
            else col, 
            axis=0)

    return fileDF

def addFileRecords(fileDF, subject):
    fileCols = fileDF.columns.tolist()
    tableName = DBpkg.getTable(subject)[0][0]
    stgTableName = f"{tableName}_STG"
    tableDF = pandas.DataFrame.from_records(DBpkg.getTableColumns(stgTableName))
    stgTableCols = tableDF[3:][0]
    tableColNum = len(stgTableCols)
    fileColNum = len(fileCols)
    #print(f"Number of table columns = {tableColNum}")
    #print(f"Number of file columns = {fileColNum}")
    if (tableColNum != fileColNum):
        return False
    fileValues = fileDF.values
    tableColsList = stgTableCols.values.tolist()
    #print(f"tableColsList: \n{tableColsList}")
    DBpkg.addRecords(stgTableName, tableColsList, fileValues)
    return True
