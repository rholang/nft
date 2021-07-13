import { DeployArgs, NodeUrls } from 'connectors/rnode-http-js'

export type Router = {
    fn: string
    client: string
    params: DeployArgs
    node: NodeUrls
}

export type RouterParams = Client & Router

export type ExploreDeployFX = { client: string; code: string }

export type DeployFX = { client: string; code: string; phloLimit: string }