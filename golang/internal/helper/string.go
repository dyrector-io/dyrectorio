package helper

func FirstN(str string, n int) string {
	if len(str) < n {
		return str
	}
	if n < 1 {
		return ""
	}
	return str[0:n]
}
