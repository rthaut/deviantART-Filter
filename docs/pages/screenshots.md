---
layout: default
title: Screenshots
permalink: /screenshots
nav_order: 4
---


# Screenshots

These are screenshots showing DeviantArt Filter v6.0.0.

|:---------- |
| ![Screenshot of DeviantArt Filter in use](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Promo.png?raw=true) |

* * *

## Dashboard

|:---------- |:--------- |
| ![Screenshot of the DeviantArt Filter dashboard](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Dashboard-Light.png?raw=true) | ![Screenshot of the DeviantArt Filter dashboard (using Dark Mode](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Dashboard-Dark.png?raw=true) |

### Dashboard - Import Results

|:---------- |:--------- |
| ![Screenshot of the filter import results](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Dashboard-Import-Results-Light.png?raw=true) | ![Screenshot of the filter import results (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Dashboard-Import-Results-Dark.png?raw=true) |

* * *

## Manage Users

|:---------- |:--------- |
| ![Screenshot of the filtered users view](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Users-Light.png?raw=true) | ![Screenshot of the filtered users view (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Users-Dark.png?raw=true) |

### Manage Users - Editing a Filter

|:---------- |:--------- |
| ![Screenshot of editing a user filter](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Users-Editing-Light.png?raw=true) | ![Screenshot of editing a user filter (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Users-Editing-Dark.png?raw=true) |

* * *

## Manage Keywords

|:---------- |:--------- |
| ![Screenshot of the filtered keywords view](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Keywords-Light.png?raw=true) | ![Screenshot of the filtered keywords view (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Keywords-Dark.png?raw=true) |

### Manage Keywords - Editing a Filter

|:---------- |:--------- |
| ![Screenshot of editing a keyword filter](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Keywords-Editing-Light.png?raw=true) | ![Screenshot of editing a keyword filter (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Keywords-Editing-Dark.png?raw=true) |

* * *

## Manage Categories

|:---------- |:--------- |
| ![Screenshot of the filtered categories view](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Categories-Light.png?raw=true) | ![Screenshot of the filtered categories view (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Categories-Dark.png?raw=true) |

### Manage Categories - Editing a Filter

|:---------- |:--------- |
| ![Screenshot of editing a category filter](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Categories-Editing-Light.png?raw=true) | ![Screenshot of editing a category filter (using Dark Mode)](https://raw.githubusercontent.com/rthaut/deviantART-Filter/master/screenshots/Categories-Editing-Dark.png?raw=true) |

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
