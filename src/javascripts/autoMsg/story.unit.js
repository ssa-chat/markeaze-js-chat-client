import 'regenerator-runtime'
import AutoMsgStory from './story'

import {mockMsg1, mockMsg2} from './autoMsg.mock'

describe('autoMsg story', () => {

  afterEach(() => {
    AutoMsgStory.removeAllItems()
  })

  describe('"getHistory" method', () => {

    it('should return empty array by default', () => {
      expect(AutoMsgStory.getHistory().length).toBe(0)
    })

  })

  describe('"getItems" method', () => {

    it('should return empty array by default', () => {
      expect(AutoMsgStory.getItems().length).toBe(0)
    })

    it('should return one item after add', () => {
      AutoMsgStory.addItems([mockMsg1])
      expect(AutoMsgStory.getItems().length).toBe(1)
    })

  })

  describe('"addItems" method', () => {

    it('should add item', () => {
      AutoMsgStory.addItems([mockMsg1])
      expect(AutoMsgStory.getItems().length).toBe(1)
    })

    it('should add messages with simiral muid', () => {
      AutoMsgStory.addItems([mockMsg1])
      AutoMsgStory.addItems([mockMsg1])
      expect(AutoMsgStory.getItems().length).toBe(2)
    })

    it('should return added items', () => {
      expect(AutoMsgStory.addItems([mockMsg1])).toStrictEqual([mockMsg1])
    })

  })

  describe('"addItems" method', () => {

    it('should set items', () => {
      AutoMsgStory.setItems([mockMsg1])
      AutoMsgStory.setItems([mockMsg2])
      expect(AutoMsgStory.getItems().length).toBe(1)
    })

    it('should return added items', () => {
      expect(AutoMsgStory.setItems([mockMsg1])).toStrictEqual([mockMsg1])
    })

  })

  describe('"removeItem" method', () => {

    it('should return one item after remove', () => {
      AutoMsgStory.addItems([mockMsg1, mockMsg2])
      expect(AutoMsgStory.removeItem(mockMsg1.muid).length).toBe(1)
    })

  })

  describe('"removeAllItems" method', () => {

    it('should remove all items', () => {
      AutoMsgStory.addItems([mockMsg1, mockMsg2])
      AutoMsgStory.removeAllItems()
      expect(AutoMsgStory.getItems().length).toBe(0)
    })

  })

})
