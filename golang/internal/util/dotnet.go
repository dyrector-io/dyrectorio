package util

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/rs/zerolog/log"
)

func MapAppsettingsToEnv(in *string) (map[string]string, error) {
	if in == nil {
		return map[string]string{}, errors.New("nil input")
	}
	if *in == "" {
		return map[string]string{}, errors.New("empty input")
	}
	envList := map[string]string{}

	root := map[string]interface{}{}
	// invalid Jason, bad Jason, go home, you are drunk!
	if err := json.Unmarshal([]byte(*in), &root); err != nil {
		return map[string]string{}, err
	}

	parseWithPrefix(envList, "", root)
	return envList, nil
}

func parseWithPrefix(envList map[string]string, prefix string, leaf interface{}) {
	switch leaf := leaf.(type) {
	case map[string]interface{}:
		prefixToAdd := ""
		if prefix != "" {
			prefixToAdd = prefix + "__"
		}
		for key, value := range leaf {
			switch value := value.(type) {
			case []interface{}:
				for index, v := range value {
					parseWithPrefix(envList, fmt.Sprintf("%s%s__%v", prefixToAdd, key, index), v)
				}
			case map[string]interface{}:
				parseWithPrefix(envList, prefixToAdd+key, value)
			case string, int:
				envList[prefixToAdd+key] = value.(string)
			case bool:
				envList[prefixToAdd+key] = fmt.Sprintf("%v", value)
			case float32, float64:
				envList[prefixToAdd+key] = fmt.Sprintf("%v", value.(float64))
			default:
				log.Info().Interface("value", value).Msg("Unexpected case")
			}
		}
	default:
		envList[prefix] = leaf.(string)
	}
}
