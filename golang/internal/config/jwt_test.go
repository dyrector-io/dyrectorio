/*
Library "github.com/golang-jwt/jwt/v4"
does not handle errors gracefully and 
panics with seg fault when the incorrect 
tokens are being introduced.
That's why all test tokens are actually valid ones.
*/
package config

import "testing"

type jwtTest struct {
	name                string
	jwtTokenStringified string
	valid               bool
}

func (j jwtTest) run(t *testing.T) {
	_, err := ValidateAndCreateJWT(j.jwtTokenStringified)
	if err != nil && j.valid {
		t.Errorf("%v", err)
	}
	if err == nil && !j.valid {
		t.Log("expected error")
	}
}

func TestJWTValidation(t *testing.T) {
	tests := []jwtTest{
		{
			name:                "valid HS256 token",
			jwtTokenStringified: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
			valid:               true,
		},
		{
			name:                "valid ES256 token",
			jwtTokenStringified: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.tyh-VfuzIxCyGYDlkBA7DfyjrqmSHu6pQ2hoZuFqUSLPNY2N0mpHb3nk5K17HWP_3cYHBw7AhHale5wky6-sVA",
			valid:               true,
		},
		{
			name:                "valid PS384 token",
			jwtTokenStringified: "eyJhbGciOiJQUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.Lfe_aCQme_gQpUk9-6l9qesu0QYZtfdzfy08w8uqqPH_gnw-IVyQwyGLBHPFBJHMbifdSMxPjJjkCD0laIclhnBhowILu6k66_5Y2z78GHg8YjKocAvB-wSUiBhuV6hXVxE5emSjhfVz2OwiCk2bfk2hziRpkdMvfcITkCx9dmxHU6qcEIsTTHuH020UcGayB1-IoimnjTdCsV1y4CMr_ECDjBrqMdnontkqKRIM1dtmgYFsJM6xm7ewi_ksG_qZHhaoBkxQ9wq9OVQRGiSZYowCp73d2BF3jYMhdmv2JiaUz5jRvv6lVU7Quq6ylVAlSPxeov9voYHO1mgZFCY1kQ",
			valid:               true,
		},
		{
			name:                "valid token used for dev",
			jwtTokenStringified: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjQ4NzQxMDM5NzQsImlzcyI6IjE3Mi4xNy4wLjE6NTAwMCIsInN1YiI6ImIzZmYwMmU5LWU4MDUtNDhjYy1hYzNkLWRhMDVhZTEwMjNkZiJ9.qVlU38JwsLFrRf85PMhMFjZ7Jm4wyxWovDCa7nPNV0g",
			valid:               true,
		},
	}
	for _, test := range tests {
		t.Run(test.name, test.run)
	}
}
