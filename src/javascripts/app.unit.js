import 'regenerator-runtime'
import cloneDeep from 'lodash/cloneDeep'
import './../../test/faviconBlink.mock'
import './../../test/view.mock'
import View from './view'
import app from './app'

describe('app', () => {

  describe('stateChangeMsg', () => {

    const clientMsg = {
      muid: 'xxxx',
      sender_type: 'client'
    }
    const agentMsg = {
      muid: 'xxxx',
      sender_type: 'agent'
    }
    const ssaMsg = {
      muid: 'xxxx',
      sender_type: 'ssa'
    }
    const mokedApp = cloneDeep(app)
    mokedApp.view = new View()
    mokedApp.pusherMsgState = jest.fn()

    afterEach(() => {
      mokedApp.pusherMsgState.mockClear()
    })

    describe('when chat uncollapsed', () => {

      beforeAll(() => {
        mokedApp.view.collapsed = false
      })

      it('should skip for client', () => {
        mokedApp.stateChangeMsg(clientMsg)
        expect(mokedApp.pusherMsgState).toHaveBeenCalledTimes(0)
      })

      it('should push \'read\' for agent', () => {
        mokedApp.stateChangeMsg(agentMsg)
        expect(mokedApp.pusherMsgState).toHaveBeenCalledWith(agentMsg.muid, 'read')
      })

      it('should push \'read\' for ssa', () => {
        mokedApp.stateChangeMsg(ssaMsg)
        expect(mokedApp.pusherMsgState).toHaveBeenCalledWith(ssaMsg.muid, 'read')
      })

    })

    describe('when chat collapsed', () => {

      beforeAll(() => {
        mokedApp.view.collapsed = true
      })

      it('should skip for client', () => {
        mokedApp.stateChangeMsg(clientMsg)
        expect(mokedApp.pusherMsgState).toHaveBeenCalledTimes(0)
      })

      it('should push \'delivered\' for agent', () => {
        mokedApp.stateChangeMsg(agentMsg)
        expect(mokedApp.pusherMsgState).toHaveBeenCalledWith(agentMsg.muid, 'delivered')
      })

      it('should push \'delivered\' for ssa', () => {
        mokedApp.stateChangeMsg(ssaMsg)
        expect(mokedApp.pusherMsgState).toHaveBeenCalledWith(ssaMsg.muid, 'delivered')
      })

    })

  })

})
