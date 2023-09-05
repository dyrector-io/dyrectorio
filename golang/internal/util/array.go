package util

func Contains[T comparable](arr []T, item T) bool {
	for _, v := range arr {
		if v == item {
			return true
		}
	}

	return false
}

// simple contain check, not part of the stdlib unfortunately
func ContainsMatcher[T comparable](arr []T, item T, comp func(T, T) bool) bool {
	if comp == nil {
		return false
	}
	for _, v := range arr {
		if comp != nil && comp(v, item) {
			return true
		}
	}

	return false
}
