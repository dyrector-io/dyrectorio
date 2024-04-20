/*
Library "github.com/golang-jwt/jwt/v4"
does not handle errors gracefully and
panics with seg fault when the incorrect
tokens are being introduced.
That's why all test tokens are actually valid ones.
*/
package config

import (
	"fmt"
	"testing"

	"github.com/golang-jwt/jwt/v4"
	"github.com/stretchr/testify/assert"
)

type jwtTest struct {
	expErr              error
	name                string
	jwtTokenStringified string
}

func (j jwtTest) run(t *testing.T) {
	_, err := ValidateAndCreateJWT(j.jwtTokenStringified)
	if j.expErr != nil {
		assert.NotNilf(t, err, "case: %v, negative a test error is required", j.name)
		assert.ErrorContainsf(t, err, j.expErr.Error(), "case: %v, should contain the expected error", j.name)
	} else {
		assert.Nilf(t, err, "case: %v, errors are unexpected. got: %v", j.name, err)
	}
}

func TestJWTValidation(t *testing.T) {
	tests := []jwtTest{
		{
			name: "valid HS256 token",
			jwtTokenStringified: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoiSm9obiBEb2UiLCJpY" +
				"XQiOjE1MTYyMzkwMjJ9.QIsEkshiagbAqIetkMcOtk0PJxH0i_KPGf8lKxTwZh8",
			expErr: nil,
		},
		{
			name: "valid ES256 token",
			jwtTokenStringified: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjNjNmU0NmQ4YWFjZWRkMTM3MWY1NTFjYjFlMWUyYjI4In" +
				"0.eyJpc3MiOiJEb24gSmhvZSIsImlhdCI6MTUxNjIzOTAyMiwic3ViIjoiMTIzNDU2NSJ9.dRhIw4QH8h8PpggmrnBmQrfcgYXSkJX1cOjv" +
				"g_DjCnsYnvTBGGJs34D3c3F6vShzgGfPY-qSlIiZ3DSkvJ1Cvw",
			expErr: nil,
		},
		{
			name: "valid PS384 token",
			jwtTokenStringified: "eyJ0eXAiOiJKV1QiLCJhbGciOiJQUzM4NCIsImtpZCI6ImFlMTdmYzJkYzRkZDE4NmE4YTVkZTE5ZjRkZTA0YzRmIn" +
				"0.eyJpc3MiOiJEb24gSmhvZSIsInN1YiI6IjEyMzM0NTY2IiwiaWF0IjoxNTE2MjM5MDIyfQ.JpCcab2YLaIvO-MCjmJOs6YKGZaVxXOnjd" +
				"xT6BVVKPm7YnZNmRH_szmNOuQmwK4i7GVqwHqXWQCpYJEfGro87hIAwf-zN7JebmShM6OUzJppTSOT8QrZD6AhYd2CPdFfR7S4nFUUbGstV" +
				"c5HN5aY8j3GFv-fmnYx31pLQMhBBzodv5uxh2GjyRNgeaSTYdZjg4IvzCdjRvP3qsT_mfcnIXULVvfmHt2K1YTi7hq31rvnE39xJ3s8uYBC" +
				"mox9Bc7OytcvBFSF09eVeBBrtxAjObDv_4_UapPeTrgi_riSuFk-6D0Eq0DzbObHCugQHN23lOIocKWE_iyYumhpNwkm-w",
			expErr: nil,
		},
		{
			name: "valid token used for dev",
			jwtTokenStringified: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzgzMjQxODQsImlzcyI6IjE3Mi4xNy4wLjE6NTAwM" +
				"CIsInN1YiI6ImIzZmYwMmU5LWU4MDUtNDhjYy1hYzNkLWRhMDVhZTEwMjNkZiJ9.EEQgUGpbfBqCtD2fL7uUj27De4FQamxEx5Ih9AkIe_U",
			expErr: nil,
		},
		{
			name: "case of robot9706, expired token",
			jwtTokenStringified: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsb2NhbGhvc3Q6NTAwMCIsImlhdCI6MTY2NjI3MDA5M" +
				"CwiZXhwIjoxNjY2MjcwMDkxLCJhdWQiOiIiLCJzdWIiOiI0NjBlZjY4NS1jY2RiLTQxMmUtOWY0ZC00MDIxMGIwOTdhMDIifQ._HhRmfzIa" +
				"_CPEJoYsCHO3E5xYGh2AmsnyggKMt9Wc_A",
			expErr: jwt.ErrTokenExpired,
		},
		{
			name: "invalid token: no issuer",
			jwtTokenStringified: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkeXJlY3RvcmlvLXRlc3QtY2FzZSIsImlhdCI6MTY2N" +
				"jE1MDc3MX0.GCg_W1Fcm_2gMFlRZKFQQcCg77BJPwIsiT-YkQ1REBk",
			expErr: fmt.Errorf("issuer is missing"),
		},
		{
			name: "invalid token: no subject",
			jwtTokenStringified: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJUZXN0IGlzc3VlciIsImlhdCI6MTY2NjE1MDc3MX0.Q" +
				"_uhcXeuATwB9hXX4zAxcizsmXJotn3C6jXmrSq99L0",
			expErr: fmt.Errorf("subject is missing"),
		},
	}
	for _, test := range tests {
		t.Run(test.name, test.run)
	}
}
