-- DropForeignKey
ALTER TABLE "Version" DROP CONSTRAINT "Version_chainId_fkey";

-- remove empty migration tables
DO $$
BEGIN

if exists(
	select * from information_schema.tables
	where table_catalog = 'crux' and table_schema = 'public' and table_name = '_prisma_migrations_Registry'
) then
  if not exists(
    select * from "_prisma_migrations_Registry"
  ) then
	  DROP TABLE "_prisma_migrations_Registry";
  end if;
end if;

if exists(
	select * from information_schema.tables
	where table_catalog = 'crux' and table_schema = 'public' and table_name = '_prisma_migrations_Storage'
) then
  if not exists(
    select * from "_prisma_migrations_Storage"
  ) then
	  DROP TABLE "_prisma_migrations_Storage";
  end if;
end if;

END
$$;

-- remove dangling version chains
delete from "VersionChain"
where id in (
	select vc.id from "VersionChain" as vc
	left join "Version" as v on v.id = vc.id
	where v.id is null
);

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "VersionChain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
