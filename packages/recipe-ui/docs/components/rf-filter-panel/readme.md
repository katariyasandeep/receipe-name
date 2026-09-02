
<!-- Auto Generated Below -->


## Overview

Category / area / ingredient filter panel.

## Properties

| Property         | Attribute         | Description                                       | Type                                   | Default |
| ---------------- | ----------------- | ------------------------------------------------- | -------------------------------------- | ------- |
| `areas`          | `areas`           | Area / cuisine options                            | `SelectOption[] \| string \| string[]` | `[]`    |
| `categories`     | `categories`      | Category options (strings or SelectOption / JSON) | `SelectOption[] \| string \| string[]` | `[]`    |
| `showIngredient` | `show-ingredient` | Show ingredient text field                        | `boolean`                              | `true`  |
| `value`          | `value`           | Current filter value                              | `RecipeFilterValue \| string`          | `{}`    |


## Events

| Event            | Description                           | Type                             |
| ---------------- | ------------------------------------- | -------------------------------- |
| `rfFilterChange` | Emitted when any filter field changes | `CustomEvent<RecipeFilterValue>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
