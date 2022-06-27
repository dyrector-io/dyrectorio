package utils

import (
	"regexp"
)

func RemoveJSONComment(strIn []byte) []byte {
	str := string(strIn)
	re1 := regexp.MustCompile(`(?im)^\s+//.*$`)
	str = re1.ReplaceAllString(str, "")
	re2 := regexp.MustCompile(`(?im)//[^"\[\]]+$`)
	str = re2.ReplaceAllString(str, "")

	return []byte(str)
}
