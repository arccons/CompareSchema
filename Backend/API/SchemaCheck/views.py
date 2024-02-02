import os
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
import SchemaCheck.src.FileProcessor as FP
import pandas

fileStr = f"{__file__.strip(os.getcwd())}"

# Create your views here.
@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def getSubjectList(request):
    subjectDF = pandas.DataFrame()
    #print(f"{fileStr}::getSubjectList: subjectDF created.")
    returnVal, msgStr, subjectDF = FP.getSubjectList(subjectDF=subjectDF)
    #print(f"{fileStr}::getSubjectList: subjectDF received.")
    if not returnVal:
        print(msgStr)
        Response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({"message": "Error in getting subjects."})

    dict_subjectDF = subjectDF.to_dict(orient='dict')
    UNIQUE_SCHEMAS = list(set(list(dict_subjectDF['SERVER_DB_SCHEMA'].values())))
    SCHEMA_SUBJECTS = list(zip(dict_subjectDF['SUBJECT_ID'].values(), dict_subjectDF['SERVER_DB_SCHEMA'].values(), dict_subjectDF['SUBJECT'].values()))
    SCHEMA_TABLES = list(zip(dict_subjectDF['SERVER_DB_SCHEMA'].values(), dict_subjectDF['TABLE_NAME'].values()))
    print(f"{fileStr}::getSubjectList: Subject list received.")
    return Response({"message": "Subject list received.", "UNIQUE_SCHEMAS": UNIQUE_SCHEMAS, "SCHEMA_SUBJECTS": SCHEMA_SUBJECTS, "SCHEMA_TABLES": SCHEMA_TABLES})

@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
def createLink(request):
    linkCreated, msgStr = FP.createLink(server_db_schema = request.data['schema'],
                                tableName = request.data['table'], 
                                subject = request.data['subject'])
    if not linkCreated:
        print(msgStr)
        Response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({"error": f"{msgStr}. Error in creating link."})
    else:
        return Response({"message": f"{msgStr}. Link created."})

@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
def createSchema(request):
    schemaCreated, msgStr = FP.createSchema(server = request.data['server'], 
                                            DB = request.data['DB'], 
                                            schema = request.data['schema'])
    if not schemaCreated:
        print(msgStr)
        #Response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({"error": f"{msgStr}. Error in creating schema."})
    else:
        return Response({"message": f"{msgStr}. Schema created."})

@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
def compareWithTable(request):
    fileDF = pandas.DataFrame()
    uploadReturn, msgStr, fileDF = FP.processUploadedFile(fileDF = fileDF, 
                                        uploadedFile = request.data['uploadedFile'], 
                                        fileType = request.data['fileType'],
                                        subject = request.data['subject'],
                                        subjectID = request.data['subject_ID'])
    if not uploadReturn:
        Response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({"error": msgStr})

    fitsWithTable = FP.compareWithTable(fileDF, request.data['subject_ID'], request.data['subject'])
    if fitsWithTable:
        return Response({"message": "File format fits table structure!"})
    else:
        Response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({"error": "Error in comparing file format to table structure."})
