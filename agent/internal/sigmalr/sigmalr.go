package sigmalr

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/philippseith/signalr"
)

const KeepAliveIntervalSeconds = 5

// Singleton, accessed only in GetSignalrInstance
var signalrServerInstance signalr.Server = nil

// GetSignalrInstance if not yet initialized spawn a signaler server & hub
func GetSignalrInstance() (signalr.Server, error) {
	log.Println("Get signalr instance")
	if signalrServerInstance == nil {
		log.Println("Spawning signalr instance")

		var err error

		signalrServerInstance, err = signalr.NewServer(context.Background(),
			signalr.UseHub(&signalr.Hub{}),
			signalr.KeepAliveInterval(KeepAliveIntervalSeconds*time.Second))
		if err != nil {
			return nil, err
		}

		return signalrServerInstance, nil
	} else {
		log.Println("Signalr: returning existing instance")
		return signalrServerInstance, nil
	}
}

type GinMappable struct {
	*gin.RouterGroup
}

func (g *GinMappable) Handle(pattern string, handler http.Handler) {
	if pattern == "" {
		log.Println("http: invalid pattern empty string")
		return
	}
	if handler == nil {
		log.Println("http: nil handler")
		return
	}

	g.HandleFunc(pattern, handler.ServeHTTP)
}

// HandleFunc registers the handler function for the given pattern.
func (g *GinMappable) HandleFunc(pattern string, handler func(writer http.ResponseWriter, req *http.Request)) {
	if handler == nil {
		log.Panic("got nil handler in HandleFunc!")
	}

	g.Any(pattern, func(c *gin.Context) {
		handler(c.Writer, c.Request)
	})
}

func Log(requestID *string, messages ...string) {
	serv, err := GetSignalrInstance()
	if err != nil {
		log.Println("Unable to send Log: ", err.Error())
		return
	}

	if serv == nil {
		log.Println("Unable to send Log, server nil!")
		return
	}

	if requestID != nil && serv != nil {
		for i := range messages {
			log.Printf("RemoteLog: %s: %s", *requestID, messages[i])
			serv.HubClients().All().Send("AddToConsole", *requestID, messages[i])
		}
	} else {
		log.Println("RemoteLog: missing id: ", messages[0])
	}
}

func SetupHub(r *gin.Engine) *gin.Engine {
	serv, err := GetSignalrInstance()
	if err != nil {
		log.Panic("failed to setup SignalR hub: ", err)
	}
	routerGroup := r.Group("hubs")
	serv.MapHTTP(&GinMappable{RouterGroup: routerGroup}, "/console")
	return r
}
