package util_test

import (
	"reflect"
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/stretchr/testify/assert"
)

func TestContains(t *testing.T) {
	arr := []string{"as", "bs", "cs"}

	assert.True(t, util.Contains(arr, "bs"), "bs is part of the array, so it must be true")
	assert.False(t, util.Contains(arr, "xs"), "xs is not part of the array, so it must be false")
}

func TestContainsMatcher(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5, 6}

	intCompareFn := func(i1, i2 int) bool {
		return i1 == i2
	}

	assert.True(t, util.ContainsMatcher(arr, 6, intCompareFn))
	assert.False(t, util.ContainsMatcher(arr, 9, intCompareFn))
	assert.False(t, util.ContainsMatcher(arr, 9, nil))
}

func TestRemoveDuplicates(t *testing.T) {
	type args struct {
		strings []string
	}
	tests := []struct {
		name string
		args args
		want []string
	}{
		{
			name: "if there is a dupe remove it",
			args: args{
				strings: []string{"apple", "apple", "bananas", "bananas", "citrone", "citrone", "date"},
			},
			want: []string{"apple", "bananas", "citrone", "date"},
		},
		{
			name: "arrays untouched if no dupe",
			args: args{
				strings: []string{"apple", "bananas", "citrone", "date"},
			},
			want: []string{"apple", "bananas", "citrone", "date"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := util.RemoveDuplicates(tt.args.strings); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("RemoveDuplicates() = %v, want %v", got, tt.want)
			}
		})
	}
}
