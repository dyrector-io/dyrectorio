local claims = {
  email_verified: false,
} + std.extVar('claims');

{
    identity: {
        traits: {
            [if 'email' in claims && claims.email_verified then 'email' else null]: claims.email,
            name: {
                first: if 'given_name' in claims then claims.given_name else null,
                last: if 'family_name' in claims then claims.family_name else null,
            },
        },
    },
}
