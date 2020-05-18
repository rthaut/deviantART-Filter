---
layout: default
title: Screenshots
permalink: /screenshots
nav_order: 4
---


# Screenshots

|:---------- |
| ![Screenshot of DeviantArt Filter in use](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/promo/Screenshot_1280x800.png) |

* * *

## Dashboard

*Screenshots from DeviantArt Filter v6.0.0.*
{: .fs-2 }

|:---------- |:--------- |
| ![Screenshot of the DeviantArt Filter dashboard](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Dashboard-Light.png) | ![Screenshot of the DeviantArt Filter dashboard (using Dark Mode](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Dashboard-Dark.png) |

### Dashboard - Import Results

*Screenshots from DeviantArt Filter v6.0.0.*
{: .fs-2 }

|:---------- |:--------- |
| ![Screenshot of the filter import results](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Dashboard-Import-Results-Light.png) | ![Screenshot of the filter import results (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Dashboard-Import-Results-Dark.png) |

* * *

## Manage Users

*Screenshots from DeviantArt Filter v6.0.0.*
{: .fs-2 }

|:---------- |:--------- |
| ![Screenshot of the filtered users view](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Users-Light.png) | ![Screenshot of the filtered users view (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Users-Dark.png) |

### Manage Users - Editing a Filter

*Screenshots from DeviantArt Filter v6.0.0.*
{: .fs-2 }

|:---------- |:--------- |
| ![Screenshot of editing a user filter](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Users-Editing-Light.png) | ![Screenshot of editing a user filter (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Users-Editing-Dark.png) |

* * *

## Manage Keywords

*Screenshots from DeviantArt Filter v6.0.0.*
{: .fs-2 }

|:---------- |:--------- |
| ![Screenshot of the filtered keywords view](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Keywords-Light.png) | ![Screenshot of the filtered keywords view (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Keywords-Dark.png) |

### Manage Keywords - Editing a Filter

*Screenshots from DeviantArt Filter v6.0.0.*
{: .fs-2 }

|:---------- |:--------- |
| ![Screenshot of editing a keyword filter](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Keywords-Editing-Light.png) | ![Screenshot of editing a keyword filter (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Keywords-Editing-Dark.png) |

* * *

## Manage Categories

*Screenshots from DeviantArt Filter v6.0.0.*
{: .fs-2 }

|:---------- |:--------- |
| ![Screenshot of the filtered categories view](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Categories-Light.png) | ![Screenshot of the filtered categories view (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Categories-Dark.png) |

### Manage Categories - Editing a Filter

*Screenshots from DeviantArt Filter v6.0.0.*
{: .fs-2 }

|:---------- |:--------- |
| ![Screenshot of editing a category filter](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Categories-Editing-Light.png) | ![Screenshot of editing a category filter (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Categories-Editing-Dark.png) |



<script src="https://cdnjs.cloudflare.com/ajax/libs/SimpleLightbox/2.1.0/simpleLightbox.min.js" integrity="sha256-1tyXmT1+SAOus10OmiTwOT7OtD3l9/8PDkN/GwWupOI=" crossorigin="anonymous"></script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/SimpleLightbox/2.1.0/simpleLightbox.min.css" integrity="sha256-NRIlTETePaYNN5ZOB75nkv7IIcQC2mr4Q+mN/T8Y4ck=" crossorigin="anonymous" />

<script>
    var images = document.querySelectorAll('img[src]');
    for (const image of images) {
        var link = document.createElement('a');
        link.setAttribute('href', image.getAttribute('src'));
        link.setAttribute('title', image.getAttribute('alt'));
        image.parentNode.insertBefore(link, image);
        link.appendChild(image);
    }

    var tables = document.querySelectorAll('table');
    for (const table of tables) {
        new SimpleLightbox({
            'elements': table.querySelectorAll('a')
        });
    }
</script>
