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
    probot = new Probot({})
    // Load our app into probot
    const app = probot.load(myProbotApp)

    // just return a test token
    app.app = () => 'test'
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
    await probot.receive({ name: 'pull_request', payload })
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
    await probot.receive({ name: 'pull_request', payload })
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
    await probot.receive({ name: 'pull_request', payload })
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
    await probot.receive({ name: 'pull_request', payload })
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
    await probot.receive({ name: 'pull_request', payload })
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
    await probot.receive({ name: 'pull_request', payload })
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
    await probot.receive({ name: 'pull_request', payload })
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
