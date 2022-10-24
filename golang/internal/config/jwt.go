package config

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type ValidJWT struct {
	Issuer           string
	Subject          string
	IssuedAt         time.Time
	StringifiedToken string
}

type CustomClaims struct {
	jwt.RegisteredClaims
}

func (config *CommonConfiguration) ParseAndSetJWT(unvalidatedToken string) error {
	if unvalidatedToken == "" {
		return fmt.Errorf("JWT cannot be empty")
	}

	token, err := ValidateAndCreateJWT(unvalidatedToken)
	if err != nil {
		return err
	}

	config.GrpcToken = token
	return nil
}

func (c *CustomClaims) Valid() error {
	vErr := new(jwt.ValidationError)
	// https://www.rfc-editor.org/rfc/rfc7519#page-10
	// standard is to use seconds
	now := time.Now()

	if !c.VerifyExpiresAt(now, false) {
		delta := now.Sub(c.ExpiresAt.Time)
		vErr.Inner = fmt.Errorf("%v by %v, now: %v, exp: %v", jwt.ErrTokenExpired, delta, now, c.ExpiresAt)
		vErr.Errors |= jwt.ValidationErrorExpired
	}

	if !c.VerifyIssuedAt(now, true) {
		vErr.Inner = fmt.Errorf("now: %v, iat: %v", now, c.IssuedAt)
		vErr.Errors |= jwt.ValidationErrorIssuedAt
	}

	if !c.VerifyNotBefore(now, false) {
		vErr.Inner = jwt.ErrTokenNotValidYet
		vErr.Errors |= jwt.ValidationErrorNotValidYet
	}

	if !c.VerifyIssuer(c.Issuer) {
		vErr.Inner = fmt.Errorf("issuer is missing")
		vErr.Errors = jwt.ValidationErrorIssuer
	}

	if !c.VerifySubject(c.Subject) {
		vErr.Inner = fmt.Errorf("subject is missing")
		vErr.Errors = jwt.ValidationErrorClaimsInvalid
	}

	if vErr.Errors == 0 {
		return nil
	}

	return vErr
}

func (c *CustomClaims) VerifyIssuer(issuer string) bool {
	return issuer != ""
}

func (c *CustomClaims) VerifySubject(subject string) bool {
	return subject != ""
}

func ValidateAndCreateJWT(unvalidatedToken string) (*ValidJWT, error) {
	jwtParser := jwt.Parser{}
	claims := CustomClaims{}
	parsed, _, err := jwtParser.ParseUnverified(unvalidatedToken, &claims)
	if err != nil {
		return nil, err
	}

	if err := parsed.Claims.Valid(); err != nil {
		return nil, err
	}

	return &ValidJWT{
		Issuer:           claims.Issuer,
		Subject:          claims.Subject,
		IssuedAt:         claims.IssuedAt.Time,
		StringifiedToken: unvalidatedToken,
	}, nil
}
