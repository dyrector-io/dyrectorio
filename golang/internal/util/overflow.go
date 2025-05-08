package util

import (
	"fmt"
	"math"
)

func SafeInt64ToUint16(n int64) (uint16, error) {
	if n < 0 || n > math.MaxUint16 {
		return 0, fmt.Errorf("overflow: %d is out of range for uint16", n)
	}
	return uint16(n), nil
}

func SafeUIntToInt(n uint) (int, error) {
	if n > math.MaxInt {
		return 0, fmt.Errorf("overflow: %d is out of range for int", n)
	}
	return int(n), nil
}

func SafeUIntToUInt16(n uint) (uint16, error) {
	if n > math.MaxUint16 {
		return 0, fmt.Errorf("overflow: %d is out of range for int", n)
	}
	return uint16(n), nil
}

func SafeUInt32ToInt32(n uint32) (int32, error) {
	if n > math.MaxInt32 {
		return 0, fmt.Errorf("overflow: %d is out of range for int32", n)
	}
	return int32(n), nil
}
