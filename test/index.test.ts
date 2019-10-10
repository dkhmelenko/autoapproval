// You can import your modules
// import index from '../src/index'

import nock from 'nock'
// Requiring our app implementation
import myProbotApp from '../src'
import { Probot } from 'probot'

const btoa = require('btoa')

nock.disableNetConnect()

describe('Autoapproval bot', () => {
  let probot: any

  beforeEach(() => {
    probot = new Probot({
            id: 123,
            cert: `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQC2RTg7dNjQMwPzFwF0gXFRCcRHha4H24PeK7ey6Ij39ay1hy2o
H9NEZOxrmAb0bEBDuECImTsJdpgI6F3OwkJGsOkIH09xTk5tC4fkfY8N7LklK+uM
ndN4+VUXTPSj/U8lQtCd9JnnUL/wXDc46wRJ0AAKsQtUw5n4e44f+aYggwIDAQAB
AoGAW2/cJs+WWNPO3msjGrw5CYtZwPuJ830m6RSLYiAPXj0LuEEpIVdd18i9Zbht
fL61eoN7NEuSd0vcN1PCg4+mSRAb/LoauSO3HXote+6Lhg+y5mVYTNkE0ZAW1zUb
HOelQp9M6Ia/iQFIMykhrNLqMG9xQIdLH8BDGuqTE+Eh8jkCQQDyR6qfowD64H09
oYJI+QbsE7yDOnG68tG7g9h68Mp089YuQ43lktz0q3fhC7BhBuSnfkBHwMztABuA
Ow1+dP9FAkEAwJeYJYxJN9ron24IePDoZkL0T0faIWIX2htZH7kJODs14OP+YMVO
1CPShdTIgFeVp/HlAY2Qqk/do2fzyueZJwJBAN5GvdUjmRyRpJVMfdkxDxa7rLHA
huL7L0wX1B5Gl5fgtVlQhPhgWvLl9V+0d6csyc6Y16R80AWHmbN1ehXQhPkCQGfF
RsV0gT8HRLAiqY4AwDfZe6n8HRw/rnpmoe7l1IHn5W/3aOjbZ04Gvzg9HouIpaqI
O8xKathZkCKrsEBz6aECQQCLgqOCJz4MGIVHP4vQHgYp8YNZ+RMSfJfZA9AyAsgP
Pc6zWtW2XuNIGHw9pDj7v1yDolm7feBXLg8/u9APwHDy
-----END RSA PRIVATE KEY-----`
    })
    // Load our app into probot
    const app = probot.load(myProbotApp)

    // just return a test token
    //app.app = () => 'test'
  })

  test('PR has already applied labels and should do nothing', async (done) => {
    const payload = require('./fixtures/pull_request.opened.json')
    const config = btoa('from_owner: []\nrequired_labels: []\nblacklisted_labels: []\napply_labels:  \n- merge')

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/contents/.github/autoapproval.yml')
      .reply(200, { content: config })

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/pulls/1/reviews', (body: any) => {
        throw new Error('PR might be already approved, no need to approve again')
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ payload })
    done()
    nock.cleanAll()
  })

  test('PR has required labels and owner satisfied - will be approved', async (done) => {
    const payload = require('./fixtures/pull_request.opened.json')
    const config = btoa('from_owner:\n  - dkhmelenko\nrequired_labels:\n  - merge\nblacklisted_labels: []\napply_labels: []')

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/contents/.github/autoapproval.yml')
      .reply(200, { content: config })

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/pulls/1/reviews', (body: any) => {
        return body.event === 'APPROVE'
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ payload })
    done()
    nock.cleanAll()
  })

  test('PR blacklisted labels entry missing - will be approved', async (done) => {
    const payload = require('./fixtures/pull_request.opened.json')
    const config = btoa('from_owner:\n  - dkhmelenko\nrequired_labels:\n  - merge\napply_labels: []')

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/contents/.github/autoapproval.yml')
      .reply(200, { content: config })

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/pulls/1/reviews', (body: any) => {
        return body.event === 'APPROVE'
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ payload })
    done()
    nock.cleanAll()
  })

  test('PR has blacklisted labels - will NOT be approved', async (done) => {
    const payload = require('./fixtures/pull_request.opened.json')
    const config = btoa('from_owner:\n  - dkhmelenko\nrequired_labels:\n  - merge\nblacklisted_labels:\n  - wip\napply_labels: []')

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/contents/.github/autoapproval.yml')
      .reply(200, { content: config })

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/pulls/1/reviews', (body: any) => {
        throw new Error('PR should not be approved in this case!')
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ payload })
    done()
    nock.cleanAll()
  })

  test('PR satisfies owner, has no required labels - will NOT be approved', async (done) => {
    const payload = require('./fixtures/pull_request.opened.json')
    const config = btoa('from_owner:\n  - dkhmelenko\nrequired_labels:\n  - ready\nblacklisted_labels: []\napply_labels: []')

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/contents/.github/autoapproval.yml')
      .reply(200, { content: config })

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/pulls/1/reviews', (body: any) => {
        throw new Error('PR should not be approved in this case!')
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ payload })
    done()
    nock.cleanAll()
  })

  test('PR has no owner, has required labels - will NOT be approved', async (done) => {
    const payload = require('./fixtures/pull_request.opened.json')
    const config = btoa('from_owner:\n  - blabla\nrequired_labels:\n  - merge\nblacklisted_labels: []\napply_labels: []')

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/contents/.github/autoapproval.yml')
      .reply(200, { content: config })

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/pulls/1/reviews', (body: any) => {
        throw new Error('PR should not be approved in this case!')
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ payload })
    done()
    nock.cleanAll()
  })

  test('PR approved, label is applied', async (done) => {
    const payload = require('./fixtures/pull_request.opened.json')
    const config = btoa('from_owner:\n  - dkhmelenko\nrequired_labels: []\nblacklisted_labels: []\napply_labels:\n  - done')

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/contents/.github/autoapproval.yml')
      .reply(200, { content: config })

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/pulls/1/reviews', (body: any) => {
        return body.event === 'APPROVE'
      })
      .reply(200)

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/issues/1/labels', (body: any) => {
        return body.includes('done')
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ payload })
    done()
    nock.cleanAll()
  })

  test('Autoapproval review was dismissed, approve PR again', async (done) => {
    const payload = require('./fixtures/pull_request_review.dismissed.json')
    const config = btoa('from_owner:\n  - dkhmelenko\nrequired_labels: []\nblacklisted_labels: []\napply_labels:\n  - merge')
    const reviews = require('./fixtures/pull_request_reviews.json')

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/contents/.github/autoapproval.yml')
      .reply(200, { content: config })

    nock('https://api.github.com')
      .get('/repos/dkhmelenko/autoapproval/pulls/1/reviews')
      .reply(200, reviews)

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/pulls/1/reviews', (body: any) => {
        return body.event === 'APPROVE'
      })
      .reply(200)

    nock('https://api.github.com')
      .post('/repos/dkhmelenko/autoapproval/issues/1/labels', (body: any) => {
        return body.includes('merge')
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ payload })
    done()
    nock.cleanAll()
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about using TypeScript in your tests, Jest recommends:
// https://github.com/kulshekhar/ts-jest

// For more information about testing with Nock see:
// https://github.com/nock/nock
