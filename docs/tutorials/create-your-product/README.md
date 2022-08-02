# Create your Product

Products are the applications you're going to manage in dyrector.io.

![The differences between each Product type in dyrector.io.](<../../.gitbook/assets/product types\_dark.png>)

### **Simple Product**

These Products have only one version and cannot be rolled back. These are mostly useful for testing purposes, because simple Products come without versions.

### **Complex Product**

Complex Products have two types of versions: Rolling and Incremental. You can define one version per Complex Product as default. That'll be the version future Complex Products will inherit images and configurations later until you set another one as default.

#### **Rolling Version**

Rolling versions are similar to simple Products except they’re perfect for continuous delivery. They’re always mutable but contrary to incremental Products they aren’t hierarchic and lack a version number.

#### **Incremental Version**

Incremental Products are hierarchical. They can have a child version and once a deployment is successful, the deployed versions, the environment variables, and the deployed images can never be modified. This guarantees you’re able to roll back the deployed version and reinstate the last functional one if any error occurs to avoid downtime.

{% hint style="info" %}
**Complex Product can have both Rolling and Incremental Versions.**

This way you can assemble versions for development and production environments. You won't need to make different products for separate purposes.
{% endhint %}
