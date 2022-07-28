# Create a Rolling Product

Rolling Products are similar to Simple Products except they’re perfect for continuous delivery. They’re always mutable but contrary to incremental Products they aren’t hierarchic and lack a version number.

**Step 1:** After picking Rolling on the switch, click ‘Save’. You’ll be directed to the Product tab. Select the product again.

**Step 2:** Click ‘Add Image’.

**Step 3:** Select the Registry you want to filter images from.

**Step 4:** Type the image’s name to filter images. Select the image by clicking on the checkbox next to it.

**Step 5:** Click ‘Add’.

**Step 6:** Pick the ‘Tag’, which is a version of the image you selected in the previous step.

{% hint style="warning" %}
Now you can define environment configurations to the selected image. For further adjustments, switch to the JSON tab where you can define other variables. Copy and paste it to another image when necessary.
{% endhint %}

**Step 7:** Click ‘Add Image’ to add another image. Repeat until you have all the desired images included in your product.
