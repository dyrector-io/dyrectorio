
create function slugify(txt varchar, id uuid)
	returns varchar
	language plpgsql
as
$$
declare
	slug varchar;
begin
	slug = normalize(txt, NFD);
	slug = regexp_replace(slug, '[\u0300-\u036f]', '', 'g');
	slug = lower(slug);
	slug = trim(slug);
	slug = regexp_replace(slug, '[^a-z0-9 ]', '', 'g');
	slug = regexp_replace(slug, '\s+', '-', 'g');
  slug = left(slug, 16);

  if length(slug) < 3 then
    return right(id::varchar, 12);
  end if;

	return slug;
end;
$$;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "slug" VARCHAR(16);

update "Team"
set "slug" = slugify("name", "id");

alter table "Team" alter column "slug" set not null;

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

drop function slugify;

ALTER TABLE "UsersOnTeams" DROP COLUMN "active";
