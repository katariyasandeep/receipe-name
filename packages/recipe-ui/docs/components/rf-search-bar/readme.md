
<!-- Auto Generated Below -->


## Overview

Search field with submit control.

## Properties

| Property      | Attribute      | Description                           | Type      | Default             |
| ------------- | -------------- | ------------------------------------- | --------- | ------------------- |
| `disabled`    | `disabled`     | Disables the whole control            | `boolean` | `false`             |
| `label`       | `label`        | Accessible label for the search field | `string`  | `'Search recipes'`  |
| `loading`     | `loading`      | Shows loading / disables submit       | `boolean` | `false`             |
| `placeholder` | `placeholder`  | Placeholder text                      | `string`  | `'Search recipes…'` |
| `submitLabel` | `submit-label` | Submit button label                   | `string`  | `'Search'`          |
| `value`       | `value`        | Current query                         | `string`  | `''`                |


## Events

| Event      | Description                            | Type                              |
| ---------- | -------------------------------------- | --------------------------------- |
| `rfSearch` | Emitted when the user submits a search | `CustomEvent<{ query: string; }>` |


## Slots

| Slot        | Description                                      |
| ----------- | ------------------------------------------------ |
| `"actions"` | Optional trailing actions (filters, clear, etc.) |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
