local claims = {
  email_verified: false,
} + std.extVar('claims');

local nameParts = std.splitLimit(claims.name, ' ', 1);

{
  identity: {
    traits: {
      [if 'email' in claims && claims.email_verified then 'email' else null]: claims.email,
        name: {
            first: nameParts[0],
            last: if std.length(nameParts) > 1 then nameParts[1] else null,
        },
    },
  },
}
