package dogger

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
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

// Writes to all available streams: std.out and grpc streams
func (dog *DeploymentLogger) Write(messages ...string) {
	for i := range messages {
		log.Printf("Deployment - %s: %s", dog.deploymentID, messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		err := dog.stream.Send(&common.DeploymentStatusMessage{
			Log: messages,
		})

		if err != nil {
			log.Printf("Deployment - %s: Status close err: %s", dog.deploymentID, err)
		}
	}
}

func (dog *DeploymentLogger) WriteDeploymentStatus(status common.DeploymentStatus, messages ...string) {
	for i := range messages {
		log.Printf("Deployment - %s - %s: %s", dog.deploymentID, status, messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		err := dog.stream.Send(&common.DeploymentStatusMessage{
			Log: messages,
			Data: &common.DeploymentStatusMessage_DeploymentStatus{
				DeploymentStatus: status,
			},
		})
		if err != nil {
			log.Printf("Deployment - %s: Status close err: %s", dog.deploymentID, err)
		}
	}
}

func (dog *DeploymentLogger) WriteContainerState(containerState string, messages ...string) {
	prefix := fmt.Sprintf("%s - %s", dog.requestID, containerState)

	for i := range messages {
		log.Printf("%s: %s", prefix, messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		instance := &common.DeploymentStatusMessage_Instance{
			Instance: &common.InstanceDeploymentItem{
				InstanceId: dog.requestID,
				State:      MapContainerState(containerState),
			},
		}

		var err = dog.stream.Send(&common.DeploymentStatusMessage{
			Log:  messages,
			Data: instance,
		})

		if err != nil {
			log.Println("Status close err: ", err.Error())
		}
	}
}

func (dog *DeploymentLogger) GetLogs() []string {
	return dog.logs
}

func (dog *DeploymentLogger) WriteString(s string) (int, error) {
	dog.Write(s)

	return len(s), nil
}

func MapContainerState(state string) common.ContainerState {
	switch state {
	case "created":
		return common.ContainerState_CREATED
	case "restarting":
		return common.ContainerState_RESTARTING
	case "running":
		return common.ContainerState_RUNNING
	case "removing":
		return common.ContainerState_REMOVING
	case "paused":
		return common.ContainerState_PAUSED
	case "exited":
		return common.ContainerState_EXITED
	case "dead":
		return common.ContainerState_DEAD
	default:
		return common.ContainerState_UNKNOWN_CONTAINER_STATE
	}
}
