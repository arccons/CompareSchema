CREATE VIEW "schema_links" AS 
	SELECT lk.schema_id "schema_id", lk.link_id "link_id", sch.DBtype "DBtype", sch.DBserver "DBserver", sch.targetDB "targetDB", sch.schema "schema", lk.subject "subject", lk.tableName "tableName" 
	from schema sch JOIN links lk ON lk.schema_id = sch.schema_id ORDER BY sch.DBtype, sch.DBserver, sch.targetDB, sch.schema