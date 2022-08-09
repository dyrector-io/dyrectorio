package dogger

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/dyrector-io/dyrectorio/agent/internal/config"
	"github.com/dyrector-io/dyrectorio/agent/internal/sigmalr"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/crux"
)

type DeploymentLogger struct {
	deploymentID string
	requestID    string
	stream       agent.Agent_DeploymentStatusClient
	logs         []string
	ctx          context.Context
	appConfig    *config.CommonConfiguration

	io.StringWriter
}

func NewDeploymentLogger(deploymentID *string,
	stream agent.Agent_DeploymentStatusClient,
	ctx context.Context,
	appConfig *config.CommonConfiguration) *DeploymentLogger {
	dog := &DeploymentLogger{
		stream:    stream,
		logs:      []string{},
		ctx:       ctx,
		requestID: "missing-request-id",
		appConfig: appConfig,
	}

	if deploymentID != nil {
		dog.deploymentID = *deploymentID
	}

	return dog
}

func (dog *DeploymentLogger) SetRequestID(requestID string) {
	dog.requestID = requestID
}

// Writes to all available streams, std.out, signalr, grpc streams
func (dog *DeploymentLogger) Write(messages ...string) {
	for i := range messages {
		log.Printf("Deployment - %s: %s", dog.deploymentID, messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		err := dog.stream.Send(&crux.DeploymentStatusMessage{
			Log: messages,
		})

		if err != nil {
			log.Printf("Deployment - %s: Status close err: %s", dog.deploymentID, err)
		}
	}

	if dog.requestID != "" {
		sigmalr.Log(&dog.requestID, messages...)
	}
}

func (dog *DeploymentLogger) WriteDeploymentStatus(status crux.DeploymentStatus, messages ...string) {
	for i := range messages {
		log.Printf("Deployment - %s - %s: %s", dog.deploymentID, status, messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		err := dog.stream.Send(&crux.DeploymentStatusMessage{
			Log: messages,
			Data: &crux.DeploymentStatusMessage_DeploymentStatus{
				DeploymentStatus: status,
			},
		})
		if err != nil {
			log.Printf("Deployment - %s: Status close err: %s", dog.deploymentID, err)
		}
	}
}

func (dog *DeploymentLogger) WriteContainerStatus(containerState string, messages ...string) {
	prefix := fmt.Sprintf("%s - %s", dog.requestID, containerState)

	for i := range messages {
		log.Printf("%s: %s", prefix, messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	sigmalr.Log(&dog.requestID, messages...)

	if dog.stream != nil {
		instance := &crux.DeploymentStatusMessage_Instance{
			Instance: &crux.InstanceDeploymentItem{
				InstanceId: dog.requestID,
				State:     MapContainerState(containerState),
			},
		}

		var err = dog.stream.Send(&crux.DeploymentStatusMessage{
			Log:  messages,
			Data: instance,
		})

		if err != nil {
			log.Println("Status close err: ", err.Error())
		}
	}

	if dog.requestID != "" {
		sigmalr.Log(&dog.requestID, messages...)
	}
}

func (dog *DeploymentLogger) GetLogs() []string {
	return dog.logs
}

func (dog *DeploymentLogger) WriteString(s string) (int, error) {
	dog.Write(s)

	return len(s), nil
}

func MapContainerState(state string) crux.ContainerState {
	switch state {
	case "created":
		return crux.ContainerState_CREATED
	case "restarting":
		return crux.ContainerState_RESTARTING
	case "running":
		return crux.ContainerState_RUNNING
	case "removing":
		return crux.ContainerState_REMOVING
	case "paused":
		return crux.ContainerState_PAUSED
	case "exited":
		return crux.ContainerState_EXITED
	case "dead":
		return crux.ContainerState_DEAD
	default:
		return crux.ContainerState_UNKNOWN_CONTAINER_STATUS
	}
}
