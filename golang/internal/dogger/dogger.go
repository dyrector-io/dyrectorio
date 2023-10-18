package dogger

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"time"

	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"

	"github.com/docker/docker/pkg/jsonmessage"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

type DoggerLevel int32

const (
	INFO    DoggerLevel = 1
	WARNING DoggerLevel = 2
	ERROR   DoggerLevel = 3
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

	LogWriter
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

// Writes to all available streams: std.out and gRPC streams
func (dog *DeploymentLogger) Write(level DoggerLevel, messages ...string) {
	for i := range messages {
		log.Info().Str("deployment", dog.deploymentID).Msg(messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		logLevel := common.DeploymentMessageLevel(level)
		err := dog.stream.Send(&common.DeploymentStatusMessage{
			Log:      messages,
			LogLevel: &logLevel,
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
		logLevel := common.DeploymentMessageLevel_INFO
		if status == common.DeploymentStatus_FAILED {
			logLevel = common.DeploymentMessageLevel_ERROR
		}
		err := dog.stream.Send(&common.DeploymentStatusMessage{
			Log:      messages,
			LogLevel: &logLevel,
			Data: &common.DeploymentStatusMessage_DeploymentStatus{
				DeploymentStatus: status,
			},
		})
		if err != nil {
			log.Error().Err(err).Stack().Str("deployment", dog.deploymentID).Msg("Write deployment status error")
		}
	}
}

func (dog *DeploymentLogger) WriteContainerState(containerState common.ContainerState, reason string, level DoggerLevel, messages ...string) {
	prefix := fmt.Sprintf("%s - %s", dog.requestID, containerState)

	for i := range messages {
		log.Info().Str("prefix", prefix).Msg(messages[i])
		dog.logs = append(dog.logs, messages...)
	}

	if dog.stream != nil {
		instance := &common.DeploymentStatusMessage_Instance{
			Instance: &common.InstanceDeploymentItem{
				InstanceId: dog.requestID,
				State:      containerState,
				Reason:     reason,
			},
		}

		logLevel := common.DeploymentMessageLevel(level)

		err := dog.stream.Send(&common.DeploymentStatusMessage{
			Log:  messages,
			LogLevel: &logLevel,
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

func (dog *DeploymentLogger) WriteContainerProgress(status string, progress float32) {
	if dog.stream != nil {
		progress := &common.DeploymentStatusMessage_ContainerProgress{
			ContainerProgress: &common.DeployContainerProgress{
				InstanceId: dog.requestID,
				Status:     status,
				Progress:   progress,
			},
		}

		err := dog.stream.Send(&common.DeploymentStatusMessage{
			Data: progress,
		})
		if err != nil {
			log.Error().
				Err(err).
				Stack().
				Str("deployment", dog.deploymentID).
				Str("prefix", dog.requestID).
				Msg("Write container progress error")
		}
	}
}

func (dog *DeploymentLogger) GetLogs() []string {
	return dog.logs
}

func (dog *DeploymentLogger) WriteInfo(s string) (int, error) {
	dog.Write(INFO, s)

	return len(s), nil
}

func (dog *DeploymentLogger) WriteError(s string) (int, error) {
	dog.Write(ERROR, s)

	return len(s), nil
}

func (dog *DeploymentLogger) WriteDockerPull(header string, respIn io.ReadCloser) error {
	if respIn == nil {
		dog.Write(INFO, fmt.Sprintf("%s ✓ up-to-date", header))
		return nil
	}

	dec := json.NewDecoder(respIn)
	stat := map[string]*status{}

	dog.WriteContainerProgress("Pulling", 0)

	lastReportTime := time.Now().UnixMilli()

	var pulled, pulling, waiting int
	for i := 0; ; i++ {
		var jm jsonmessage.JSONMessage
		if err := dec.Decode(&jm); err != nil {
			if err == io.EOF {
				dog.Write(INFO, fmt.Sprintf("%s ✓ pull complete ", header))
				dog.WriteContainerProgress("Pull complete", 1)
				return nil
			}
		}

		phase := imageHelper.LpsFromString(jm.Status)
		if phase != imageHelper.LayerProgressStatusUnknown && stat[jm.ID] == nil {
			stat[jm.ID] = &status{}
		}
		switch {
		case phase == imageHelper.LayerProgressStatusMatching:
			dog.Write(INFO, fmt.Sprintf("%s ✓ up-to-date", header))
			return nil
		case phase == imageHelper.LayerProgressStatusStarting ||
			phase == imageHelper.LayerProgressStatusWaiting:
			stat[jm.ID].Total = jm.Progress.Total
			waiting++
			dog.Write(INFO, fmt.Sprintf("%v layers: %d/%d, %s %s", header, pulled, len(stat), jm.ID, jm.Status))
		case phase == imageHelper.LayerProgressStatusDownloading:
			stat[jm.ID].Current = jm.Progress.Current
			if stat[jm.ID].Total == 0 {
				stat[jm.ID].Total = jm.Progress.Total
			}
			pulling++
		case phase == imageHelper.LayerProgressStatusComplete || phase == imageHelper.LayerProgressStatusExists:
			pulled++
			dog.Write(INFO, fmt.Sprintf("%v layers: %d/%d, %s %s", header, pulled, len(stat), jm.ID, jm.Status))
		}

		time := time.Now().UnixMilli()
		if time-lastReportTime >= 500 {
			lastReportTime = time

			total := float32(len(stat))
			sum := float32(0)
			for _, status := range stat {
				if status.Total == 0 {
					continue
				}
				sum = sum + (float32(status.Current) / float32(status.Total))
			}

			dog.WriteContainerProgress("Pulling", sum/total)
		}
	}
}
