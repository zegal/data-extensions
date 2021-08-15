# data-extensions

Pluggable library to extend mongoose schemas to serve metadata and save metadata
---

Metadata: supported
 -- "data" using FieldDefinitions
 -- "tags": array of strings

# Include this in your project package.json like this:

```
  "dependencies": {
    ......
    "data-extensions": "git+https://data-extensions-token:qieTnfr6_GE76heKp892@git.dragonlaw.com.hk/zegal/back-end/data-extensions.git#master"
    ......
  },

```

# Then initialize once

```
init(<mongoose DB objections>, <options>, <router>);

```

Sample options:

{data: {
    schemaName: [your name or default to "data"]
 },
 tags: {
    schemaName: [your name or default to "tags"]
 }
}

If you modify the schemaName, the effect will be

  MyObject {
    [schemaName]: {}
  }

If inlineWithObject == false it will create a new collection called [schemaName]; each document in that new collection will still be:
  {
    refId:
    origin:
    data:
  }

# Then extend your schemas
