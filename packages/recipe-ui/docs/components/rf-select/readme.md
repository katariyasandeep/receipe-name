
<!-- Auto Generated Below -->


## Overview

Labeled select control.

## Properties

| Property      | Attribute     | Description                                              | Type                       | Default     |
| ------------- | ------------- | -------------------------------------------------------- | -------------------------- | ----------- |
| `disabled`    | `disabled`    | Disabled                                                 | `boolean`                  | `false`     |
| `error`       | `error`       | Error message                                            | `string \| undefined`      | `undefined` |
| `label`       | `label`       | Visible label                                            | `string`                   | `''`        |
| `name`        | `name`        | Name attribute                                           | `string \| undefined`      | `undefined` |
| `options`     | `options`     | Options list (object or JSON string for attribute usage) | `SelectOption[] \| string` | `[]`        |
| `placeholder` | `placeholder` | Placeholder option label                                 | `string`                   | `'Select…'` |
| `required`    | `required`    | Required                                                 | `boolean`                  | `false`     |
| `value`       | `value`       | Selected value                                           | `string`                   | `''`        |


## Events

| Event      | Description                    | Type                  |
| ---------- | ------------------------------ | --------------------- |
| `rfChange` | Emitted when selection changes | `CustomEvent<string>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
