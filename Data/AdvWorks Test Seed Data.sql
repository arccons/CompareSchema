INSERT INTO public.subjects_temp(
	subject_id, server_db_schema, table_name, subject)
	VALUES (gen_random_uuid(), 'localhost.AdventureWorks.sales', 'salesorderdetail', 'AdvWrks Sales Details');
INSERT INTO public.subjects_temp(
	subject_id, server_db_schema, table_name, subject)
	VALUES (gen_random_uuid(), 'localhost.AdventureWorks.production', 'billofmaterials', 'AdvWrks BOM');
INSERT INTO public.subjects_temp(
	subject_id, server_db_schema, table_name, subject)
	VALUES (gen_random_uuid(), 'localhost.AdventureWorks.production', 'product', 'AdvWrks Product');
INSERT INTO public.subjects_temp(
	subject_id, server_db_schema, table_name, subject)
	VALUES (gen_random_uuid(), 'localhost.AdventureWorks.purchasing', 'productvendor', 'AdvWrks Product Vendor');
INSERT INTO public.subjects_temp(
	subject_id, server_db_schema, table_name, subject)
	VALUES (gen_random_uuid(), 'localhost.AdventureWorks.purchasing', 'purchaseorderheader', 'AdvWrks PO Header');
