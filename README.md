# Cloudflare Gateway

This repository is meant for use in conjunction with [Cortex-Publisher](https://github.com/crtxio/cortex-publisher). The cf-gateway Cloudflare worker serves as the gateway for your Cortex-Publisher.

## Prerequisites

1. First you must have followed and successfully deployed the [Cortex-Publisher](https://github.com/crtxio/cortex-publisher).

2. Create a Cloudflare API Token. For more information on how create and use API tokens for use in CI/CD please visit [Create a Cloudflare API token](https://developers.cloudflare.com/workers/wrangler/ci-cd/#create-a-cloudflare-api-token). If you have already completed this from deploying the [Cortex-Publisher](https://github.com/crtxio/cortex-publisher) then you may skip this step.

3. Install the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

4. (__*Optional*__): [Install the Github CLI](https://cli.github.com/manual/installation).

## Deployment

1. [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/crtxio/cf-gateway) <---- __*Click Here*__

    - This will bring you to a web page requiring your Cloudflare account ID and API Token that you created from the previous step.
    - You will also be linked to the newly forked repository to enable Github Workflows. For more information on workflows pleas visit Github's [About workflows](https://docs.github.com/en/actions/using-workflows/about-workflows).

    __*Note*__: This will run an initial workflow that will fail by design as you do not currently have the required Github actions secrets populated for a clean deployment. Updates to come on this part of the deployment process in the future.

2. Create the following KV namespaces in your Cloudflare account.

    - RESOLVER
    - RESOLVER-PREVIEW

   To create the KV namespaces, you must have Wrangler CLI installed then run the following commands in your console. Make sure to record the output ID's for each KV namespace as they are needed for use in a later step.

    ```console
        wrangler kv:namespace create "RESOLVER"
        wrangler kv:namespace create "RESOLVER" --preview

    ```

      __*Note*__: If you didn't capture the KV namespace ID's you can run the following command from your console to acquire them.

    ```console
        wrangler kv:namespace list
    ```

3. Navigate to your newly forked repository to configure github actions with the following secrets. Visit the official Github docs on how to use [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

    - __*CLOUDFLARE_API_TOKEN*__: The API token associated to your Cloudflare account.
    - __*CLOUDFLARE_ACCOUNT_ID*__: The ID of your Cloudflare account.
    - __*RESOLVER_KV_ID*__: The ID of the RESOLVER KV you created in the previous step
    - __*RESOLVER_KV_PREVIEW_ID*__: The ID of the RESOLVER_PREVIEW KV you created in the previous step.

    __*Note*__: You may also use the Github CLI to accomplish the same.

    ```console
        gh secret set REPO_OWNER/REPO_NAME <__*CLOUDFLARE_API_TOKEN*__>
        gh secret set REPO_OWNER/REPO_NAME <__*CLOUDFLARE_ACCOUNT_ID*__>
        gh secret set REPO_OWNER/REPO_NAME <__*RESOLVER_KV_ID*__>
        gh secret set REPO_OWNER/REPO_NAME <__*RESOLVER_KV_PREVIEW_ID*__>
    ```

4. Navigate to the initial failed workflow from [deployment step 1](#deployment) in Github Actions and click the "Re-run jobs" dropdown and "Re-run all jobs" selection. The Github workflow will re-run and deploy the cloudflare worker to your account.
