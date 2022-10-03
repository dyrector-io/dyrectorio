package config

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
)

type JWTToken struct {
	Header        JWTHeader
	Payload       JWTPayload
	Signature     string
	InitialString string
}

type JWTHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ,omitempty"`
}

type JWTPayload struct {
	Iss string `json:"iss,omitempty"`
	Sub string `json:"sub,omitempty"`
	Aud string `json:"aud,omitempty"`
	Exp string `json:"exp,omitempty"`
	Iat int    `json:"iat,omitempty"`
}

func (field *JWTToken) SetValue(unvalidatedToken string) error {
	if unvalidatedToken == "" {
		return fmt.Errorf("grpc jwt token can not be unset")
	}

	token, err := ValidateAndCreateJWT(unvalidatedToken)
	if err != nil {
		return err
	}

	*field = token
	return nil
}

func ValidateAndCreateJWT(unvalidatedToken string) (JWTToken, error) {
	split := strings.Split(unvalidatedToken, ".")

	token := JWTToken{}

	if len(split) < 3 {
		return token, fmt.Errorf("error decoding header jwt: jwt doesn't have all necessary parts")
	}
	decodedHeaderString, err := base64.RawStdEncoding.DecodeString(split[0])

	if err != nil {
		return token, fmt.Errorf("error decoding header jwt: %v", err)
	}

	if err := json.Unmarshal(decodedHeaderString, &token.Header); err != nil {
		return token, fmt.Errorf("error serializing header jwt: %v", err)
	}

	decodedPayloadString, err := base64.RawStdEncoding.DecodeString(split[1])

	if err != nil {
		return token, fmt.Errorf("error decoding payload jwt: %v", err)
	}

	if err := json.Unmarshal(decodedPayloadString, &token.Payload); err != nil {
		return token, fmt.Errorf("error serializing payload jwt: %v", err)
	}

	token.Signature = split[2]
	token.InitialString = unvalidatedToken

	return token, nil

}
