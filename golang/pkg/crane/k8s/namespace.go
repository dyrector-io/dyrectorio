package k8s

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"

	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
)

// Namespace wrapper for the facade
type Namespace struct {
	ctx       context.Context
	client    *Client
	appConfig *config.Configuration
	name      string
}

// namespace entity
type NamespaceResponse struct {
	Name string `json:"name" binding:"required"`
}

func NewNamespaceClient(ctx context.Context, name string, client *Client) *Namespace {
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
	exists, err := n.Exists()
	if err != nil {
		return fmt.Errorf("namespace fetching error in ensure: %w", err)
	}

	if !exists {
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

func (n *Namespace) Exists() (bool, error) {
	client, err := n.getNamespaceClient()
	if err != nil {
		return false, err
	}

	_, err = client.Get(n.ctx, n.name, metav1.GetOptions{})
	if err != nil {
		if errors.IsNotFound(err) {
			return false, nil
		}
		return false, err
	}
	return true, nil
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
