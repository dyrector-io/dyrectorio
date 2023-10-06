package pointer

// Creates a new pointer of type T
func NewPTR[T any](value T) *T {
	return &value
}
