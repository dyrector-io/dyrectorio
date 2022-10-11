package util_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
)

func TestRemoveJSONComment(t *testing.T) {
	teststr := `{//comment
	//testcomments:
			// comment   
            // comment
	    	  //   comment
			  "json" : true, //comment
			  "i":"o",//
"example": "// //"//
}`
	expectstr := `{			  "json" : true,			  "i":"o","example": "// //"}`
	resultbyte := util.RemoveJSONComment([]byte(teststr))

	assert.Equal(t, expectstr, string(resultbyte))
}
