import request from '@/utils/request'

export function getAsk (req) {
  return request({
    url: 'robot/ask',
    method: 'get',
    params: req
  })
}
