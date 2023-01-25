package k8s

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"io"
	"os"

	"golang.org/x/sync/errgroup"

	"github.com/rs/zerolog/log"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

const LogBufferSize = 2048

type KubeContainerLogReader struct {
	EventChannel chan grpc.ContainerLogEvent
	LogStreams   []io.ReadCloser
	ErrorGroup   *errgroup.Group

	grpc.ContainerLogReader
}

func (kubeReader *KubeContainerLogReader) Next() <-chan grpc.ContainerLogEvent {
	return kubeReader.EventChannel
}

func (kubeReader *KubeContainerLogReader) Close() error {
	for _, stream := range kubeReader.LogStreams {
		err := stream.Close()
		if err != nil {
			log.Error().Err(err).Stack().Msg("Failed to close pod log stream")
		}
	}
	return kubeReader.ErrorGroup.Wait()
}

func getSelfPodID() (string, error) {
	value := os.Getenv("HOSTNAME")
	if value == "" {
		return "", errors.New("unknown hostname")
	}
	return value, nil
}

func openPodLogReaders(ctx context.Context,
	client *kubernetes.Clientset,
	prefixName *common.ContainerIdentifier,
	podLogOptions *v1.PodLogOptions,
) ([]io.ReadCloser, bool, error) {
	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("app=%s", prefixName.GetName()),
	}

	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	pods, err := client.CoreV1().Pods(prefixName.Prefix).List(ctx, listOptions)
	if err != nil {
		return nil, false, err
	}

	if len(pods.Items) == 0 {
		return nil, false, errors.New("no pods found")
	}

	selfPodNamespace := cfg.Namespace
	selfPodName, err := getSelfPodID()
	if err != nil {
		return nil, false, err
	}

	enableEcho := true

	var logStreams []io.ReadCloser
	for podIndex := range pods.Items {
		pod := &pods.Items[podIndex]

		if prefixName.Prefix == selfPodNamespace && pod.Name == selfPodName {
			log.Trace().
				Str("podNamespace", pod.Namespace).
				Str("podName", pod.Name).
				Str("selfNamespace", selfPodNamespace).
				Str("selfName", selfPodName).
				Msg("Found self, disabled echo")
			enableEcho = false
		}

		log.Info().Msgf("Starting to log pod %s-%s", prefixName.Prefix, pod.Name)

		stream, err := client.CoreV1().Pods(prefixName.Prefix).GetLogs(pod.Name, podLogOptions).Stream(ctx)
		if err != nil {
			if len(logStreams) > 0 {
				for _, closeStream := range logStreams {
					err = closeStream.Close()
					if err != nil {
						log.Error().Err(err).Stack().Msg("Failed to close pod log stream")
					}
				}
			}

			return nil, false, err
		}

		logStreams = append(logStreams, stream)
	}

	return logStreams, enableEcho, nil
}

func PodLog(ctx context.Context, request *agent.ContainerLogRequest) (*grpc.ContainerLogContext, error) {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)

	client, err := NewClient(cfg).GetClientSet()
	if err != nil {
		return nil, err
	}

	prefixName := request.GetPrefixName()
	if prefixName == nil {
		return nil, errors.New("prefixName undefined")
	}

	tail := int64(request.GetTail())

	podLogOpts := &v1.PodLogOptions{
		Follow:     request.GetStreaming(),
		TailLines:  &tail,
		Timestamps: true,
	}
	logStreams, enableEcho, err := openPodLogReaders(ctx, client, prefixName, podLogOpts)
	if err != nil {
		return nil, err
	}

	eventChannel := make(chan grpc.ContainerLogEvent)
	group, errCtx := errgroup.WithContext(ctx)

	for _, stream := range logStreams {
		logStream := stream
		group.Go(func() error {
			reader := bufio.NewReader(logStream)

			for {
				message, err := reader.ReadString('\n')
				if err != nil {
					eventChannel <- grpc.ContainerLogEvent{
						Message: "",
						Error:   err,
					}

					return err
				}

				eventChannel <- grpc.ContainerLogEvent{
					Message: message,
					Error:   nil,
				}
			}
		})
	}

	go func() {
		<-errCtx.Done()

		for _, stream := range logStreams {
			err := stream.Close()
			if err != nil {
				log.Error().Err(err).Stack().Msg("Failed to close pod log stream")
			}
		}
	}()

	logReader := &KubeContainerLogReader{
		EventChannel: eventChannel,
		ErrorGroup:   group,
		LogStreams:   logStreams,
	}

	logContext := &grpc.ContainerLogContext{
		Reader:     logReader,
		EnableEcho: enableEcho,
	}

	return logContext, nil
}
