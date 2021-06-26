import { makeRNodeWeb } from '@tgrospic/rnode-http-js'

const { fetch, document } = window

const makeRnode = makeRNodeWeb({ fetch, now: Date.now })

export const { rnodeHttp, sendDeploy, getDataForDeploy, propose } = makeRnode
