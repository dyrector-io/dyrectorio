---
description: >-
  To better understand how you’ll be able to manage your applications in
  dyrector.io, there are certain components – entities and concepts – within
  dyrector.io that need to be cleared.
---

# Components

### Node

Nodes are deployment targets. They can be Docker, Kubernetes or on-premises environments; it really depends on your needs. Specifying at least one Node is a basic requirement of both using dyrector.io and deploying your application. For this reason, we suggest this should be the first step you do after the first login. &#x20;

### **Team**

A group of users working on the same project. On your first login you must define a team, to which you can invite your teammates’ profiles. Teams can have multiple Nodes and Registries.&#x20;

### Profile

Your user profile on dyrector.io.

### Audit log

Audit logs collect team activity. It lists executed actions, the users who initiated them and the time of when the actions happened.

Logs are assigned to teams. One profile can belong to multiple teams.

### Registry

Registry is the place where you can store your images. You can use any Docker Registry API V2 compatible Registry with dyrector.io, and besides them GitHub and GitLab Registries. Docker Hub Library is available to every user by default.&#x20;

### Product

Products are the applications you’ll manage in dyrector.io. There are two types of Products.&#x20;

* **Simple:** these Products have only one version and cannot be rolled back. These are mostly useful for testing purposes, because simple Products come without versions.&#x20;
* **Complex:** complex Products have two types of versions: Rolling and Incremental.
  * **Rolling:** rolling versions are similar to simple Products except they’re perfect for continuous delivery. They’re always mutable but contrary to incremental Products they aren’t hierarchic and lack a version number.&#x20;
  * **Incremental:** incremental Products are hierarchical. They can have a child version and once a deployment is successful, the deployed versions, the environment variables, and the deployed images can never be modified. This guarantees you’re able to roll back the deployed version and reinstate the last functional one if any error occurs to avoid downtime.&#x20;

Regardless of the type of product you want to manage, you can pick the images you want to include in the managed version and also specify configurations that belong to them.

### Deployment

After assembling your product, you can trigger a deployment to a Node. Users can assign environment and configuration variables to the deployments.
