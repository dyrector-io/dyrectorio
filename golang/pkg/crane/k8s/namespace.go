package k8s

import (
	"context"

	"github.com/rs/zerolog/log"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"

	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
)

// namespace wrapper for the facade
type namespace struct {
	ctx       context.Context
	name      string
	appConfig *config.Configuration
}

// namespace entity
type Namespace struct {
	Name string `json:"name" binding:"required"`
}

func newNamespace(ctx context.Context, name string, cfg *config.Configuration) *namespace {
	ns := namespace{ctx: ctx, name: name, appConfig: cfg}
	return &ns
}

func (n *namespace) deployNamespace() error {
	// Add default namespace if not found
	name := n.name
	if n.name == "" {
		name = "default"
	}

	return DeployNamespace(n.ctx, name, n.appConfig)
}

func DeployNamespace(ctx context.Context, name string, cfg *config.Configuration) error {
	client, err := getNamespaceClient(cfg)
	if err != nil {
		return err
	}

	_, err = client.Apply(ctx,
		corev1.Namespace(name),
		metav1.ApplyOptions{
			FieldManager: cfg.FieldManagerName,
			Force:        cfg.ForceOnConflicts,
		})

	if err != nil {
		log.Error().Err(err).Stack().Send()
		return err
	}
	return nil
}

func extractName(in *apiv1.NamespaceList) []Namespace {
	out := []Namespace{}

	for i := range in.Items {
		out = append(out, Namespace{Name: in.Items[i].Name})
	}
	return out
}

func GetNamespaces(cfg *config.Configuration) ([]Namespace, error) {
	client, err := getNamespaceClient(cfg)
	if err != nil {
		return nil, err
	}
	rawList, err := client.List(context.Background(), metav1.ListOptions{})

	list := extractName(rawList)
	if err != nil {
		log.Error().Err(err).Stack().Send()
	}
	return list, err
}

func DeleteNamespace(ctx context.Context, name string, cfg *config.Configuration) error {
	client, err := getNamespaceClient(cfg)
	if err != nil {
		return err
	}

	err = client.Delete(
		ctx,
		name,
		metav1.DeleteOptions{},
	)

	return err
}

func getNamespaceClient(cfg *config.Configuration) (v1.NamespaceInterface, error) {
	clientset, err := NewClient().GetClientSet(cfg)
	if err != nil {
		return nil, err
	}

	client := clientset.CoreV1().Namespaces()

	return client, nil
}
