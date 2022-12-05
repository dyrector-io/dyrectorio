package k8s

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"

	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
)

// Namespace wrapper for the facade
type Namespace struct {
	ctx       context.Context
	client    *Client
	name      string
	appConfig *config.Configuration
}

// namespace entity
type NamespaceResponse struct {
	Name string `json:"name" binding:"required"`
}

func NewNamespace(ctx context.Context, name string, client *Client) *Namespace {
	ns := Namespace{ctx: ctx, name: name, client: client, appConfig: client.appConfig}
	return &ns
}

func (n *Namespace) getNamespaceClient() (v1.NamespaceInterface, error) {
	clientset, err := NewClient(n.appConfig).GetClientSet()
	if err != nil {
		return nil, err
	}

	client := clientset.CoreV1().Namespaces()

	return client,

		nil
}

func (n *Namespace) EnsureExists(namespace string) error {
	namespaces, err := n.GetNamespaces()
	if err != nil {
		return fmt.Errorf("namespace fetching error in ensure: %w", err)
	}

	namespaceFound := false
	for _, item := range namespaces {
		if item.Name == namespace {
			namespaceFound = true
			break
		}
	}
	if !namespaceFound {
		return n.DeployNamespace(namespace)
	}
	return nil
}

func (n *Namespace) DeployNamespace(name string) error {
	clientSet, err := n.getNamespaceClient()
	if err != nil {
		return err
	}

	if n.name == "" {
		n.name = "default"
	}

	_, err = clientSet.Apply(n.ctx,
		corev1.Namespace(name),
		metav1.ApplyOptions{
			FieldManager: n.appConfig.FieldManagerName,
			Force:        n.appConfig.ForceOnConflicts,
		})

	if err != nil {
		log.Error().Err(err).Stack().Send()
		return err
	}
	return nil
}

func (n *Namespace) GetNamespaces() ([]NamespaceResponse, error) {
	client, err := n.getNamespaceClient()
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

func (n *Namespace) DeleteNamespace(name string) error {
	client, err := n.getNamespaceClient()
	if err != nil {
		return err
	}

	err = client.Delete(
		n.ctx,
		name,
		metav1.DeleteOptions{},
	)

	return err
}

func extractName(in *apiv1.NamespaceList) []NamespaceResponse {
	out := []NamespaceResponse{}

	for i := range in.Items {
		out = append(out, NamespaceResponse{Name: in.Items[i].Name})
	}
	return out
}
