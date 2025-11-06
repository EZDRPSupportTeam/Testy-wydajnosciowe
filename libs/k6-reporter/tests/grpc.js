import grpc from 'k6/net/grpc'
import { check } from 'k6'
import { Counter } from 'k6/metrics'

import { htmlReport } from '../dist/bundle.js'
import { textSummary } from './libs/k6-summary/index.js'

const client = new grpc.Client()
client.load(['.'], 'hello.proto')
var grpcReqCounter = new Counter('grpc_reqs')

export let options = {
  stages: [{ duration: '2s', target: 5 }],
}

export function handleSummary(data) {
  return {
    'summary-grpc.html': htmlReport(data, { debug: true }),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}

export default () => {
  client.connect('localhost:50051', { plaintext: true })
  const data = { name: 'Bert' }
  grpcReqCounter.add(1)
  const response = client.invoke('Hello/SayHello', data)


  client.close()
}
