import { defineStore } from 'pinia'

export const useCallStore = defineStore('call', {
  state: () => ({
    inCall: false,
    roomId: '',
    expertId: '',
    userId: '',
  }),

  actions: {
    startCall({ roomId, expertId, userId }) {
      this.inCall = true
      this.roomId = roomId
      this.expertId = expertId
      this.userId = userId
    },
    endCall() {
      this.inCall = false
      this.roomId = ''
      this.expertId = ''
      this.userId = ''
    },
  },
})
