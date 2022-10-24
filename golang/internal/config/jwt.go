package config

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type ValidJWT struct {
	Issuer           string
	Subject          string
	IssuedAt         int64
	StringifiedToken string
}

type CustomClaims struct {
	jwt.StandardClaims
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
	// we issue tokens using msec, the original tests
	// https://www.rfc-editor.org/rfc/rfc7519#page-10
	// no exact rule in spec for this
	now := time.Now().UnixMilli()

	if !c.VerifyExpiresAt(now, false) {
		delta := time.Unix(now, 0).Sub(time.Unix(c.ExpiresAt, 0))
		vErr.Inner = fmt.Errorf("%s by %s", jwt.ErrTokenExpired, delta)
		vErr.Errors |= jwt.ValidationErrorExpired
	}

	if !c.VerifyIssuedAt(now, true) {
		vErr.Inner = jwt.ErrTokenUsedBeforeIssued
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
		IssuedAt:         claims.IssuedAt,
		StringifiedToken: unvalidatedToken,
	}, nil
}
