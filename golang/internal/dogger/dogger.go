package dogger

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"

	"github.com/docker/docker/pkg/jsonmessage"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

type status struct {
	Current int64
	Total   int64
}

type DeploymentLogger struct {
	deploymentID string
	requestID    string
	stream       agent.Agent_DeploymentStatusClient
	logs         []string
	ctx          context.Context
	appConfig    *config.CommonConfiguration

	io.StringWriter
}

func NewDeploymentLogger(ctx context.Context, deploymentID *string,
	stream agent.Agent_DeploymentStatusClient,
	appConfig *config.CommonConfiguration,
) *DeploymentLogger {
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
		log.Info().Str("deployment", dog.deploymentID).Msg(messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		err := dog.stream.Send(&common.DeploymentStatusMessage{
			Log: messages,
		})
		if err != nil {
			log.Error().Err(err).Stack().Str("deployment", dog.deploymentID).Msg("Write error")
		}
	}
}

func (dog *DeploymentLogger) WriteDeploymentStatus(status common.DeploymentStatus, messages ...string) {
	for i := range messages {
		log.Info().Str("deployment", dog.deploymentID).Msg(messages[i])
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
			log.Error().Err(err).Stack().Str("deployment", dog.deploymentID).Msg("Write deployment status error")
		}
	}
}

func (dog *DeploymentLogger) WriteContainerState(containerState string, messages ...string) {
	prefix := fmt.Sprintf("%s - %s", dog.requestID, containerState)

	for i := range messages {
		log.Info().Str("prefix", prefix).Msg(messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		instance := &common.DeploymentStatusMessage_Instance{
			Instance: &common.InstanceDeploymentItem{
				InstanceId: dog.requestID,
				State:      MapContainerState(containerState),
			},
		}

		err := dog.stream.Send(&common.DeploymentStatusMessage{
			Log:  messages,
			Data: instance,
		})
		if err != nil {
			log.Error().
				Err(err).
				Stack().
				Str("deployment", dog.deploymentID).
				Str("prefix", prefix).
				Msg("Write container state error")
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

func (dog *DeploymentLogger) WriteDockerPull(header string, respIn io.ReadCloser) error {
	if respIn == nil {
		dog.Write(fmt.Sprintf("%s ✓ up-to-date", header))
		return nil
	}

	dec := json.NewDecoder(respIn)
	stat := map[string]*status{}

	var pulled, pulling, waiting int
	for i := 0; ; i++ {
		var jm jsonmessage.JSONMessage
		if err := dec.Decode(&jm); err != nil {
			if err == io.EOF {
				dog.Write(fmt.Sprintf("%s ✓ pull complete ", header))
				return nil
			}
		}

		phase := imageHelper.LpsFromString(jm.Status)
		if phase != imageHelper.LayerProgressStatusUnknown && stat[jm.ID] == nil {
			stat[jm.ID] = &status{}
		}
		switch {
		case phase == imageHelper.LayerProgressStatusMatching:
			dog.Write(fmt.Sprintf("%s ✓ up-to-date", header))
			return nil
		case phase == imageHelper.LayerProgressStatusStarting ||
			phase == imageHelper.LayerProgressStatusWaiting:
			stat[jm.ID].Total = jm.Progress.Total
			waiting++
			dog.Write(fmt.Sprintf("%v layers: %d/%d, %s %s", header, pulled, len(stat), jm.ID, jm.Status))
		case phase == imageHelper.LayerProgressStatusDownloading:
			stat[jm.ID].Current = jm.Progress.Current
			pulling++
		case phase == imageHelper.LayerProgressStatusComplete || phase == imageHelper.LayerProgressStatusExists:
			pulled++
			dog.Write(fmt.Sprintf("%v layers: %d/%d, %s %s", header, pulled, len(stat), jm.ID, jm.Status))
		}
	}
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
		return common.ContainerState_CONTAINER_STATE_UNSPECIFIED
	}
}
