# Create a Rolling Version

Rolling Versions are similar to Simple Products except they’re perfect for continuous delivery. They’re always mutable but contrary to incremental Products they aren’t hierarchic and lack a version number.

**Step 1:** After picking Rolling on the switch, click ‘Save’. You’ll be directed to the Product tab. Select the product again.

**Step 2:** Click ‘Add version’.

**Step 3:** Enter the rolling version's name and specify a changelog.

![](../../../.gitbook/assets/rolling\_01.jpg)

**Step 4:** Click 'Save'. You'll be directed to the board of versions of your Rolling Product.

**Step 5:** Click 'Images' button that belongs to the version you'd like to assemble.

![](../../../.gitbook/assets/rolling\_02.jpg)

**Step 6:** Click 'Add image'.

![](../../../.gitbook/assets/rolling\_03.jpg)

**Step 7:** Select the Registry you want to filter images from.

**Step 8:** Type the image’s name to filter images. Select the image by clicking on the checkbox next to it.

![](../../../.gitbook/assets/rolling\_04.jpg)

**Step 9:** Click ‘Add’.

**Step 10:** Pick the ‘Tag’, which is a version of the image you selected in the previous step.

{% hint style="warning" %}
Now you can define environment configurations to the selected image. For further adjustments, click on the JSON tab where you can define other variables. Copy and paste it to another image when necessary.
{% endhint %}

![](../../../.gitbook/assets/rolling\_05.jpg)

**Step 11:** Click ‘Add Image’ to add another image. Repeat until you have all the desired images included in your product.
