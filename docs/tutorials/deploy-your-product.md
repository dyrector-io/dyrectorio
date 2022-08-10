# Deploy your Product

Deploying the Product is the final stage of dyrector.io's core functionality. You can do it by following the steps below.

**Step 1:** Open the Product you'd like to deploy.

![](../.gitbook/assets/deployment\_01.jpg)

**Step 2:** Click 'Add deployment'.

**Step 3:** Select the Node in the Add deployment field.

![](../.gitbook/assets/deployment\_02.jpg)

**Step 4:** Add environment and other variables. You're able to define and adjust configurations in the JSON editor.

![](../.gitbook/assets/deployment\_03.jpg)

**Step 5:** Click 'Deploy'. If everything goes right, deployment status should switch from 'Preparing' to 'In progress'. When deployment's complete the status should be 'Successful'.

![](../.gitbook/assets/deployment\_04.jpg)

![](../.gitbook/assets/deployment\_05.jpg)

### Custom configuration options

You're able to customize your deployment's configurations. You're able to specify the following ones.

**screenshot idevaló**

#### JSON

You're also able to customize your configuration in JSON format, for easier copying. The variables by default are the following:

The result should look like this:

<pre class="language-json5"><code class="lang-json5">{
  // Running application container name.
  "name": "mysql",
  // Path/volume bindings for containers.
  "mounts": ["data|/var/lib/mysql"],
<strong>  // Maps an internal 80 to external 8080, external refers to the host's port.
</strong>  "ports": [
    {
      "internal": 80,
      "external": 8080
    }
  ],
  // Docker specific networkMode configuration, can be host or none.
  "networkMode": "none",
  // Environment variables used to configure application behavior.
  // Tribute to https://12factor.net
  "environment": {},
  // WIP (not available yet) configure container behavior based on annotations.
  "capabilities": {},
  // If managed ingress is enabled on node (traefik or ingress is deployed)
  // ingress could be generated here. This is for http traffic for now.
  "expose": {"public": true, "tls": true}
}</code></pre>

