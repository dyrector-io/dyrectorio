# Configuration management

Configurations can be all over the place without a single source of truth when left unmanaged for long periods of time. The more configurations you need to deal with, the more likely you’ll lose track of them. dyrector.io can be used as single source of truth for all of your configurations, while being able to add, remove or modify configurations directly or via the JSON editor.

Every configuration you specify will remain stored after any modification or deletion to ensure you won’t have to spend time again defining already specified configurations.

### How is it better than using a Git repository?

Git repositories containing the configurations of your microservice architecture can be all over the place because one repo won’t cover all the configurations for all the images & components in your architecture. dyrector.io substitutes Git repos by bringing every variable that belong to a specific Product in one place.

#### Use cases

* **Think ahead:** designing is the first step towards efficient and secure configuration management. Go through your organization’s structure, consider privileges and access points. This step is crucial for more efficient configuration management.&#x20;
* **Configuration roll back:** if it turns out the new configuration variables need to be reworked to maintain uptime of your application, you can roll back the last functioning ones.
* **In progress – Bundled configurations:** instead of specifying the same configurations one by one to each component, you can apply variables to multiple components with one click by bundling them up.
