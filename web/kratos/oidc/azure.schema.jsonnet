local claims = std.extVar('claims');

{
    identity: {
        traits: {
            [if 'email' in claims then 'email' else null]: claims.email,
            name: {
                first: claims.given_name,
                last: claims.family_name,
            },
        },
    },
}
