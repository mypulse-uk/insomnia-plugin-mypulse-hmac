# MyPulse HMAC Insomnia Plugin

### How to install?
The plugin currently does not get published, therefore the only way to use it
is by copying the plugin files from the repo.

1. Download this repository
1. run `go plugin:install_dev`
1. In Insomnia click `Tools > Reload Plugins`

### How to use this plugin?

The plugin will add the required HMAC headers to each request if the following
conditions are met.

1. The request has a `X-Mp-Access-Key` header set
1. The environment contains a map named `mpSecretAccessKeys`
1. The `mpSecretAccessKeys` map contains an entry for the access key used in the request

![Example Request](https://github.com/mypulse-uk/insomnia-plugin-mypulse-hmac/assets/6555386/06d01bea-41bc-48ef-980a-e4c0740f1185)
![Example Environment](https://github.com/mypulse-uk/insomnia-plugin-mypulse-hmac/assets/6555386/69d8fcd5-a180-4f39-b1e1-ef3d82785555)
