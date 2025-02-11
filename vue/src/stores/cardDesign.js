import { defineStore } from 'pinia'

export const useCardDesignStore = defineStore('cardDesign', {
  state: () => ({
    selectedCardBack: localStorage.getItem('selectedCardBack') || '/card_back.png'
  }),
  actions: {
    setCardBack(imageUrl) {
      this.selectedCardBack = imageUrl
      localStorage.setItem('selectedCardBack', imageUrl)
    },
    resetCardBack() {
      this.selectedCardBack = '/card_back.png'
      localStorage.removeItem('selectedCardBack')
    }
  }
})