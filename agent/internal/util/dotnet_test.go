//go:build unit
// +build unit

/*
Note on validating map values: deep matching with reflect and fmt.Sprint are two important
available tools.
Ref: fmt.Sprint works well since Go 1.12 https://tip.golang.org/doc/go1.12#fmt
Ref: pkg reflect docs https://cs.opensource.google/go/go/+/go1.17:src/reflect/deepequal.go;l=209
*/

package util_test

import (
	"fmt"
	"testing"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/stretchr/testify/assert"
)

func TestMapAppsettingsToEnv_nil(t *testing.T) {
	c, err := util.MapAppsettingsToEnv(nil)

	assert.Equal(t, map[string]string{}, c)
	assert.NotNil(t, err)
}

func TestMapAppsettingsToEnv_Empty(t *testing.T) {
	in := ""
	c, err := util.MapAppsettingsToEnv(&in)

	assert.Equal(t, map[string]string{}, c)
	assert.NotNil(t, err)
}

func TestMapAppsettingsToEnv_Invalid(t *testing.T) {
	in := `{
		"AppIdentifier"<><> "test.dyrector.io"
	}`
	c, err := util.MapAppsettingsToEnv(&in)

	assert.Equal(t, map[string]string{}, c)
	assert.NotNil(t, err)
}

func TestMapAppsettingsToEnv_OneDepth(t *testing.T) {
	in := `{
		"AppIdentifier": "test.dyrector.io"
	}`
	c, err := util.MapAppsettingsToEnv(&in)

	expected := map[string]string{
		"AppIdentifier": "test.dyrector.io",
	}

	assert.Equal(t, fmt.Sprint(expected), fmt.Sprint(c))
	assert.Nil(t, err)
}

func TestMapAppsettingsToEnv_TwoDepth(t *testing.T) {
	in := `{
		"AppIdentifier": "test.dyrector.io",
		"DefaultData": {
			"Path": "/app/config/import",
			"SelfAddress": "http://localhost:8080"
  		}
	}`
	result, err := util.MapAppsettingsToEnv(&in)

	expected := map[string]string{
		"AppIdentifier":            "test.dyrector.io",
		"DefaultData__Path":        "/app/config/import",
		"DefaultData__SelfAddress": "http://localhost:8080",
	}

	assert.EqualValues(t, fmt.Sprint(expected), fmt.Sprint(result))
	assert.Nil(t, err)
}

func TestMapAppsettingsToEnv_ThreeDepth(t *testing.T) {
	in := `
	{
		"Serilog": {
			"MinimumLevel": {
				"Default": "Debug",
				"Override": {
					"Microsoft": "Information",
					"Microsoft.AspNetCore.Hosting": "Information",
					"Microsoft.AspNetCore.Mvc": "Information",
					"System": "Information"
				}
			}
		}
	}

	`
	result, err := util.MapAppsettingsToEnv(&in)

	expected := map[string]string{
		"Serilog__MinimumLevel__Default":                                "Debug",
		"Serilog__MinimumLevel__Override__Microsoft":                    "Information",
		"Serilog__MinimumLevel__Override__Microsoft.AspNetCore.Hosting": "Information",
		"Serilog__MinimumLevel__Override__Microsoft.AspNetCore.Mvc":     "Information",
		"Serilog__MinimumLevel__Override__System":                       "Information",
	}

	assert.EqualValues(t, fmt.Sprint(expected), fmt.Sprint(result))
	assert.Nil(t, err)
}
func TestMapAppsettingsToEnv_ArrayValues(t *testing.T) {
	in := `
	{
		"Serilog": {
			"Enrich": [ "FromLogContext", "WithMachineName", "WithThreadId" ]
		}
	}
	`
	result, err := util.MapAppsettingsToEnv(&in)

	expected := map[string]string{
		"Serilog__Enrich__0": "FromLogContext",
		"Serilog__Enrich__1": "WithMachineName",
		"Serilog__Enrich__2": "WithThreadId",
	}

	assert.EqualValues(t, fmt.Sprint(expected), fmt.Sprint(result))
	assert.Nil(t, err)
}

func TestMapAppsettingsToEnv_ArrayObject(t *testing.T) {
	in := `
	{
		"Serilog": {
			"WriteTo": [
				{
					"Name": "Console",
					"Args": {
					"outputTemplate": "===> {Timestamp:HH:mm:ss.fff zzz} [{Level}] {Message}{NewLine}{Exception}"
					}
				},
				{
					"Name": "File",
					"Args": {
						"path": "logs/",
						"outputTemplate": "===> {Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level}] {Message}{NewLine}{Exception}",
						"retainedFileCountLimit": 10,
						"rollingInterval": "Day",
						"rollOnFileSizeLimit": false
					}
				}
			]
		}
	}
	`
	result, err := util.MapAppsettingsToEnv(&in)

	expected := map[string]string{
		"Serilog__WriteTo__0__Name":                 "Console",
		"Serilog__WriteTo__0__Args__outputTemplate": "===> {Timestamp:HH:mm:ss.fff zzz} [{Level}] {Message}{NewLine}{Exception}",
		"Serilog__WriteTo__1__Name":                 "File",
		"Serilog__WriteTo__1__Args__path":           "logs/",
		"Serilog__WriteTo__1__Args__outputTemplate":
		// line break
		"===> {Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level}] {Message}{NewLine}{Exception}",
		"Serilog__WriteTo__1__Args__retainedFileCountLimit": "10",
		"Serilog__WriteTo__1__Args__rollingInterval":        "Day",
		"Serilog__WriteTo__1__Args__rollOnFileSizeLimit":    "false",
	}

	assert.Equal(t, fmt.Sprint(expected), fmt.Sprint(result))
	assert.Nil(t, err)
}
