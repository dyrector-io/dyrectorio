package config

import (
	"fmt"
	"github.com/golang-jwt/jwt/v4"
)

type ValidJWT struct {
	Token            jwt.Token
	StringifiedToken string
}

func (field *ValidJWT) SetValue(unvalidatedToken string) error {
	if unvalidatedToken == "" {
		return fmt.Errorf("grpc token can not be unset")
	}

	token, err := ValidateAndCreateJWT(unvalidatedToken)
	if err != nil {
		return err
	}

	*field = token
	return nil
}

func ValidateAndCreateJWT(unvalidatedToken string) (ValidJWT, error) {

	token := ValidJWT{}

	jwtParser := jwt.Parser{}
	parsed, _, err := jwtParser.ParseUnverified(unvalidatedToken, &jwt.RegisteredClaims{})

	if err != nil {
		return token, err
	}

	token.Token = *parsed
	token.StringifiedToken = unvalidatedToken

	return token, nil
}
