package util

import (
	"regexp"
)

func RemoveJSONComment(strIn []byte) []byte {
	str := string(strIn)
	// edgecase that isn't handled: double quote in the comment
	re1 := regexp.MustCompile(`([ \t]*)//\s*?[^"\\S]*?\s*?(\n|\r|\r\n|\n\r)`)
	str = re1.ReplaceAllString(str, "")

	return []byte(str)
}
