# GDClient

Node.js library for interacting with Geometry Dash servers. Every single endpoint is implemented, but currently not tested very well.

This library is a work in progress. In the future it will also include tools for level string creation and save file reading/writing.

# Example

```js
import { Client } from 'gd-client';

const client = new Client();

const levels = await client.levels.fetch();
```
