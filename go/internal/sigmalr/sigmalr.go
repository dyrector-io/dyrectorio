package sigmalr

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/philippseith/signalr"
)

var SignalrServ signalr.Server = nil

const KeepAliveIntervalSeconds = 5

// GetSignalrInstance if not yet initialized spawn a signaler server & hub
func GetSignalrInstance() (signalr.Server, error) {
	log.Println("Get signalr instance")
	if SignalrServ == nil {
		log.Println("Spawning signalr instance")

		var err error

		SignalrServ, err = signalr.NewServer(context.Background(),
			signalr.UseHub(&signalr.Hub{}),
			signalr.KeepAliveInterval(KeepAliveIntervalSeconds*time.Second))
		if err != nil {
			return nil, err
		}

		return SignalrServ, nil
	} else {
		log.Println("Signalr: returning existing instance")
		return SignalrServ, nil
	}
}

type GinMappable struct {
	*gin.RouterGroup
}

func (g *GinMappable) Handle(pattern string, handler http.Handler) {
	if pattern == "" {
		panic("http: invalid pattern empty string")
	}
	if handler == nil {
		panic("http: nil handler")
	}

	g.HandleFunc(pattern, handler.ServeHTTP)
}

// HandleFunc registers the handler function for the given pattern.
func (g *GinMappable) HandleFunc(pattern string, handler func(writer http.ResponseWriter, req *http.Request)) {
	if handler == nil {
		panic("http: nil handler is not ok")
	}

	g.Any(pattern, func(c *gin.Context) {
		handler(c.Writer, c.Request)
	})
}

func Log(requestID *string, messages ...string) {
	if requestID != nil && SignalrServ != nil {
		for i := range messages {
			log.Printf("RemoteLog: %s: %s", *requestID, messages[i])
			SignalrServ.HubClients().All().Send("AddToConsole", *requestID, messages[i])
		}
	} else {
		log.Println("RemoteLog: missing id: ", messages[0])
	}
}

func SetupHub(r *gin.Engine) *gin.Engine {
	serv, err := GetSignalrInstance()
	if err != nil {
		panic(err)
	}
	routerGroup := r.Group("hubs")
	serv.MapHTTP(&GinMappable{RouterGroup: routerGroup}, "/console")
	return r
}
