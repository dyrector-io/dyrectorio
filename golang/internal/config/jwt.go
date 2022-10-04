package config

import (
	"fmt"
	"github.com/form3tech-oss/jwt-go"
)

type ValidJWT struct {
	Token string
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

	token := ValidJWT{
		Token: unvalidatedToken,
	}

	jwtParser := jwt.Parser{}
	_, _, err := jwtParser.ParseUnverified(unvalidatedToken, &jwt.StandardClaims{})

	return token, err
}
