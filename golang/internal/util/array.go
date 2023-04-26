package util

// simple contain check, not part of the stdlib unfortunately
func Contains[T comparable](arr []T, str T) bool {
	for _, v := range arr {
		if v == str {
			return true
		}
	}

	return false
}
