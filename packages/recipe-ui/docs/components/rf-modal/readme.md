
<!-- Auto Generated Below -->


## Overview

Accessible modal dialog with focus trap basics and Escape to close.

## Properties

| Property          | Attribute           | Description                    | Type      | Default |
| ----------------- | ------------------- | ------------------------------ | --------- | ------- |
| `closeOnBackdrop` | `close-on-backdrop` | Close when backdrop is clicked | `boolean` | `true`  |
| `heading`         | `heading`           | Dialog heading                 | `string`  | `''`    |
| `open`            | `open`              | Whether the dialog is open     | `boolean` | `false` |


## Events

| Event     | Description                            | Type                |
| --------- | -------------------------------------- | ------------------- |
| `rfClose` | Emitted when the dialog requests close | `CustomEvent<void>` |


## Slots

| Slot       | Description      |
| ---------- | ---------------- |
|            | Main dialog body |
| `"footer"` | Action buttons   |


## Shadow Parts

| Part         | Description |
| ------------ | ----------- |
| `"backdrop"` |             |
| `"dialog"`   |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
