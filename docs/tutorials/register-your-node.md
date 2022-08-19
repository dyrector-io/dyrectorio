# Register your Node

Regardless of the type of the target environment, you’ll have to register it as a Node in dyrector.io.

**Step 1:** Open Nodes on the left and click ‘Add’ on top right.

**Step 2:** Enter your Node’s name and select its icon.

{% hint style="success" %}
Tip: You can write a description so others on your team can understand what’s the purpose of this Node.
{% endhint %}

![](../.gitbook/assets/nodes\_01.jpg)

**Step 3:** Click ‘Save’ and select the type of technology your Node uses. You can select

* Docker Host,
* and Kubernetes Cluster.

Docker Host requirements are the following:

* a Linux host/VPS,
* Docker or Podman installed on host,
* ability to execute the script on host.

Kubernetes Cluster requirements are the following:

* a Kubernetes cluster,
* kubectl authenticated, active context selected,
* ability to run these commands.

**Step 4:** After picking the technology, click the ‘Generate script’ button to generate a one-liner script.

![](../.gitbook/assets/nodes\_02.jpg)

**Step 5:** Run the one-liner in sh or bash.

The one-liner will generate a script that’ll set dyrector.io’s agent up on your Node.

{% hint style="info" %}
Information and status of your Node will show in the Connection section, so you can see if the setup is successful.
{% endhint %}
