import request from '@/utils/request'

export function getAsk (req) { // type2
  return request({
    url: 'robot/ask',
    method: 'get',
    params: req
  })
}
export function getDB3Ask (req) { // type3
  return request({
    url: 'qa/getQAByQuery',
    method: 'get',
    params: req
  })
}
