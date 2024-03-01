CREATE TABLE "links" (
	"link_id" INTEGER NOT NULL,
	"schema_id" INTEGER NOT NULL,
	"subject" TEXT NOT NULL,
	"tableName" TEXT NOT NULL,
	PRIMARY KEY("link_id" AUTOINCREMENT)
)