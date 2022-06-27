package dogger

import (
	"context"
	"fmt"
	"log"

	"gitlab.com/dyrector_io/dyrector.io/go/internal/config"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/sigmalr"
	"gitlab.com/dyrector_io/dyrector.io/protobuf/go/agent"
	"gitlab.com/dyrector_io/dyrector.io/protobuf/go/crux"
)

type DeploymentLogger struct {
	deploymentID string
	requestID    string
	stream       agent.Agent_DeploymentStatusClient
	logs         []string
	ctx          context.Context
	appConfig    *config.CommonConfiguration
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

	if sigmalr.SignalrServ != nil && dog.requestID != "" {
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

	if sigmalr.SignalrServ != nil {
		sigmalr.Log(&dog.requestID, messages...)
	}

	if dog.stream != nil {
		instance := &crux.DeploymentStatusMessage_Instance{
			Instance: &crux.InstanceDeploymentItem{
				InstanceId: dog.requestID,
				Status:     MapContainerState(containerState),
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

	if sigmalr.SignalrServ != nil && dog.requestID != "" {
		sigmalr.Log(&dog.requestID, messages...)
	}
}

func (dog *DeploymentLogger) GetLogs() []string {
	return dog.logs
}

func MapContainerState(state string) crux.ContainerStatus {
	switch state {
	case "created":
		return crux.ContainerStatus_CREATED
	case "restarting":
		return crux.ContainerStatus_RESTARTING
	case "running":
		return crux.ContainerStatus_RUNNING
	case "removing":
		return crux.ContainerStatus_REMOVING
	case "paused":
		return crux.ContainerStatus_PAUSED
	case "exited":
		return crux.ContainerStatus_EXITED
	case "dead":
		return crux.ContainerStatus_DEAD
	default:
		return crux.ContainerStatus_UNKNOWN_CONTAINER_STATUS
	}
}
