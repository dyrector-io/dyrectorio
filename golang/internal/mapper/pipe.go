package mapper

import "strings"

// TODO(nandor-magyar): refactor this into unmarshalling
// `[]"VARIABLE|value"` pair mapped into a string keyed map, collision is ignored, the latter value is used
func PipeSeparatedToStringMap(arr *[]string) map[string]string {
	mapResult := make(map[string]string)

	if arr != nil {
		for _, e := range *arr {
			if strings.ContainsRune(e, '|') {
				eSplit := strings.Split(e, "|")
				mapResult[eSplit[0]] = eSplit[1]
			}
		}
	}

	return mapResult
}
