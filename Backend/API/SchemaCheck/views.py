# from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
import SchemaCheck.src.FileProcessor as FP
import pandas

# Create your views here.
@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def getData(request):
    row = pandas.DataFrame()
    row = FP.getSubjectList(request.data['subject'])
    return Response(row)

@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def getSubjectList(request):
    subjectDF = pandas.DataFrame()
    subjectDF = FP.getSubjectList()
    SUBJECTS = []
    TABLE_NAMES = []
    #if subjectDF.empty:
        #return Response({"SUBJECTS": [], "TABLE_NAMES": []}) #, "Error": "Could not get subject and table list."})
    #print(f"Subject List = \n{subjectDF}")
    for item in subjectDF.values:
        SUBJECTS.append(item[0])
        TABLE_NAMES.append(item[1])

    return Response({"SUBJECTS": SUBJECTS, "TABLE_NAMES": TABLE_NAMES})

@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
def processFile(request):
    subjBaseExists = FP.checkSubject(request.data['subject'])
    fileDF = pandas.DataFrame()
    fileDF = FP.processUploadedFile(request.data['uploadedFile'], request.data['fileType'])

    if not subjBaseExists:
        subjBaseExists = FP.createSubjectBase(fileDF, request.data['table'], request.data['subject'])
    
    recordsUploaded = False
    if subjBaseExists:
        recordsUploaded = FP.addFileRecords(fileDF, request.data['subject'])

    if subjBaseExists & recordsUploaded:
        return Response({"message": "File uploaded!"})
    else:
        return Response({"message": "Error!"})
