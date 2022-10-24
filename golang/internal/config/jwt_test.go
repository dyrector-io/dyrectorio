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

	"github.com/stretchr/testify/assert"
)

type jwtTest struct {
	name                string
	jwtTokenStringified string
	expErr              error
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

func TestConfigSetValueEmpty(t *testing.T) {
	cfg := &CommonConfiguration{}
	err := cfg.ParseAndSetJWT("")

	assert.ErrorContains(t, err, "JWT cannot be empty", "field is required, error is expected")
}

func TestConfigSetValueValid(t *testing.T) {
	cfg := &CommonConfiguration{}
	tokenStr := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMj" +
		"J9.QIsEkshiagbAqIetkMcOtk0PJxH0i_KPGf8lKxTwZh8"
	err := cfg.ParseAndSetJWT(tokenStr)

	assert.Nil(t, err, "for a valid token error should be nil")
	assert.EqualValues(t, tokenStr, cfg.GrpcToken.StringifiedToken)
}

func TestConfigSetValueInvalid(t *testing.T) {
	cfg := &CommonConfiguration{}
	err := cfg.ParseAndSetJWT("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMj" +
		"J9")

	assert.Errorf(t, err, "invalid token should throw error")
}

func TestJWTValidation(t *testing.T) {
	tests := []jwtTest{
		{
			name: "dyrectorio like token",
			jwtTokenStringified: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjYxNjg2NDc1OTAsImlzcyI6IjE3Mi4xNy4wLjE6N" +
				"TAwMCIsInN1YiI6IjYwYmJiMTZlLWE5NzktNDU1Ny1hNTA4LTJmZWJhMjIyMmQwMiJ9.vm-wJo-WmgpZk6SsMLK_7GZIrRufP05jebIUOCD1J2Q",
			expErr: nil,
		},
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
			jwtTokenStringified: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjQ4NzQxMDM5NzQsImlzcyI6IjE3Mi4xNy4wLjE6N" +
				"TAwMCIsInN1YiI6ImIzZmYwMmU5LWU4MDUtNDhjYy1hYzNkLWRhMDVhZTEwMjNkZiJ9.qVlU38JwsLFrRf85PMhMFjZ7Jm4wyxWovDCa7nPNV0g",
			expErr: nil,
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
