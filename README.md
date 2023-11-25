## The Infrastructure Setup

### The Dependencies for the Project
1. making sure from setup :

    Terraform

    Node 16+


2. Install stable release of CDKTF by using



        npm install --global cdktf-cli

making sure from the setup ``cdktf help``

3. Here project already setup in package/iac , if not , initialize CDKTF with the appropriate template for TypeScript

``cdktf init --template=typescript --local``

4. install prodiver [Hashicups](https://registry.terraform.io/providers/hashicorp/hashicups/latest/docs)

``npm install @cdktf/provider-hashicups``

if the provider not available pre-built packages setup , add it to the ``terraformProviders`` array in the ``cdktf.json`` file

``"terraformProviders": ["aws@~> 2.0", "dnsimple/dnsimple"]``

Go to the working directory and run ``cdktf get`` to create the appropriate TypeScript classes for the provider automatically.

Generated output will be in ``.gen``