CREATE TABLE "schema" (
	"schema_id" INTEGER NOT NULL,
	"DBtype" TEXT NOT NULL,
	"DBserver" TEXT NOT NULL,
	"targetDB" TEXT NOT NULL,
	"schema" TEXT NOT NULL,
	PRIMARY KEY("schema_id" AUTOINCREMENT)
)