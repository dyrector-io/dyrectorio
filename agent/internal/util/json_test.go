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
"kek": "// //"//
}`
	expectstr := `{				            	    	  			  "json" : true, 			  "i":"o","kek": "// //"}`
	resultbyte := util.RemoveJSONComment([]byte(teststr))

	assert.Equal(t, string(resultbyte), expectstr)
}
