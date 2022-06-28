package k8s

import (
	"context"
	"log"

	_ "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"

	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"

	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
)

// namespace wrapper for the facade
type namespace struct {
	name string
}

// namespace entity
type Namespace struct {
	Name string `json:"name" binding:"required"`
}

func newNamespace(name string) *namespace {
	ns := namespace{name: name}
	return &ns
}

func (n *namespace) deployNamespace() error {
	client, err := getNamespaceClient()
	if err != nil {
		return err
	}

	// Add default namespace if not found
	if n.name == "" {
		n.name = "default"
	}

	_, err = client.Apply(context.TODO(),
		corev1.Namespace(n.name),
		metav1.ApplyOptions{
			FieldManager: config.Cfg.FieldManagerName,
			Force:        config.Cfg.ForceOnConflicts,
		})

	if err != nil {
		log.Println(err.Error())
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

func GetNamespaces() ([]Namespace, error) {
	client, err := getNamespaceClient()
	if err != nil {
		return nil, err
	}
	rawList, err := client.List(context.TODO(), metav1.ListOptions{})

	list := extractName(rawList)
	if err != nil {
		log.Println(err)
	}
	return list, err
}

func DeleteNamespace(name string) error {
	client, err := getNamespaceClient()
	if err != nil {
		return err
	}

	err = client.Delete(
		context.TODO(),
		name,
		metav1.DeleteOptions{},
	)

	return err
}

func getNamespaceClient() (v1.NamespaceInterface, error) {
	clientset, err := GetClientSet()

	if err != nil {
		return nil, err
	}

	client := clientset.CoreV1().Namespaces()

	return client, nil
}
