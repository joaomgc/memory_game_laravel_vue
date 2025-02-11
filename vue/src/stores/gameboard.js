import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from './user'
import { errorMessages } from 'vue/compiler-sfc'
import { toast } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast/use-toast'

export const useGameBoardStore = defineStore('gameboard', () => {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    // Game State
    const cards = ref([])
    const selectedCards = ref([])
    const matchedCards = ref([])
    const isGameWon = ref(false)
    const boardId = ref(null)
    const turnCount = ref(0)
    const mode = ref(null)
    const currentGameId = ref(null)

    // Timer State
    const startTime = ref(Date.now())
    const elapsedTime = ref(0)
    const timerInterval = ref(null)
    const hasGameStarted = ref(false)

    // Game Mode Configuration
    const gridConfig = computed(() => {
        switch (mode.value) {
            case '3x4': return { rows: 3, cols: 4 }
            case '4x4': return { rows: 4, cols: 4 }
            case '6x6': return { rows: 6, cols: 6 }
            default: return { rows: 0, cols: 0 }
        }
    })

    const formattedTime = computed(() => {
        const minutes = Math.floor(elapsedTime.value / 60000)
        const seconds = Math.floor((elapsedTime.value % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })

    // Timer Methods
    const startTimer = () => {
        if (!hasGameStarted.value) {
            hasGameStarted.value = true
            startTime.value = Date.now()
            timerInterval.value = setInterval(() => {
                elapsedTime.value = Date.now() - startTime.value
            }, 1000)
        }
    }

    const resetTimer = () => {
        hasGameStarted.value = false
        stopTimer()
        elapsedTime.value = 0
    }
    

    const stopTimer = () => {
        if (timerInterval.value) {
            clearInterval(timerInterval.value)
        }
    }

    // Game Initialization
    const initializeGame = async (gameMode) => {
        // Determine board_id based on game mode
        switch (gameMode) {
            case '3x4':
                boardId.value = 1
                break
            case '4x4':
                boardId.value = 2
                break
            case '6x6':
                boardId.value = 3
                break
        }

        // Reset game state
        mode.value = gameMode
        turnCount.value = 0
        matchedCards.value = []
        selectedCards.value = []
        isGameWon.value = false
        elapsedTime.value = 0
        currentGameId.value = null

        // Create initial game record
        if (authStore.user) {
            try {
                const gameData = {
                    type: 'S', // Single-player game
                    created_user_id: authStore.userId,
                    status: 'PE', // Pending
                    began_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    board_id: boardId.value
                }

                const response = await axios.post('games', gameData)

                if(gameMode !== '3x4') {
                    authStore.user.brain_coins_balance -= 1;
                }

                currentGameId.value = response.data.data.id
            } catch (error) {
                console.error('Error creating game:', error)
            }
        }

        // Card Generation and other existing initialization logic...
        const suits = ['c', 'e', 'p', 'o']
        const totalCards = gridConfig.value.rows * gridConfig.value.cols

        const cardSet = suits.flatMap(suit =>
            Array.from({ length: 7 }, (_, i) => ({
                id: `${suit}${i + 1}`,
                image: `/${suit}${i + 1}.png`,
                isFlipped: false,
                isRemoved: false
            })).concat(
                Array.from({ length: 3 }, (_, i) => ({
                    id: `${suit}${i + 11}`,
                    image: `/${suit}${i + 11}.png`,
                    isFlipped: false
                }))
            )
        )

        // Select and shuffle cards
        cards.value = cardSet.slice(0, totalCards / 2).flatMap(card => [
            { ...card, uniqueKey: Math.random() },
            { ...card, uniqueKey: Math.random() }
        ]).sort(() => Math.random() - 0.5)

        // Start the timer
        // startTimer()
        resetTimer()
    }

    // Card Interaction
    const flipCard = (card) => {
        if (
            matchedCards.value.includes(card.id) ||
            selectedCards.value.length === 2 ||
            selectedCards.value.find(c => c.uniqueKey === card.uniqueKey)
        ) return
    
        // Inicia o timer ao virar a primeira carta
        if (!hasGameStarted.value) {
            startTimer()
        }
    
        card.isFlipped = true
        selectedCards.value.push(card)
    
        if (selectedCards.value.length === 2) {
            turnCount.value++
    
            setTimeout(() => {
                if (selectedCards.value[0].id === selectedCards.value[1].id) {
                    matchedCards.value.push(selectedCards.value[0].id)
                    // Mark matched cards as removed
                    cards.value.forEach(card => {
                        if (card.id === selectedCards.value[0].id) {
                            card.isRemoved = true
                        }
                    })
                } else {
                    selectedCards.value.forEach(c => {
                        const cardToFlip = cards.value.find(card => card.uniqueKey === c.uniqueKey)
                        if (cardToFlip) cardToFlip.isFlipped = false
                    })
                }
                selectedCards.value = []
                checkGameCompletion()
            }, 1000)
        }
    }
    


    let canExecute = true;
    const revealHint = async () => {
        const { toast } = useToast();
        if (!canExecute) { // para impedir varias execucoes enquanto a carta vira
            return;
        }
        canExecute = false;
        try {
            const user = await userStore.fetchUser(authStore.userId);
            let coins = authStore.userBrainCoinsBalance
            if (coins < 1) {
                toast({
                    description: 'You need at least 1 coin to reveal a hint',
                    variant: 'destructive'
                });
                return
            }
            const coinUpdateResponse = await userStore.updateCoins(user, coins - 1);

            if (!coinUpdateResponse) {
                console.error('Coin deduction failed');
                return;
            }

            const unmatchedCards = cards.value.filter(card => !matchedCards.value.includes(card.id) && !card.isFlipped);

            const matchingPair = unmatchedCards.reduce((pair, card) => {
                if (pair) return pair; // If a pair is already found, return it
                const match = unmatchedCards.find(other => other.id === card.id && other.uniqueKey !== card.uniqueKey);
                return match ? [card, match] : null;
            }, null);

            if (matchingPair) {
                matchingPair.forEach(card => { flipCard(card) });
            }
        } catch (error) {
            console.error('Error revealing hint:', error)
        }
        setTimeout(() => {
            canExecute = true;
        }, 1000);
    }


        const checkGameCompletion = () => {
        const allCardsFlipped = cards.value.every(card => 
            matchedCards.value.includes(card.id)
        )
    
        if (allCardsFlipped) {
            stopTimer()
            isGameWon.value = true
    
            if (authStore.user) {
                // Capture final time before saving
                const finalTime = elapsedTime.value
                saveSinglePlayerGameResults()
            }
        }
    }

    // Save Game Results
    const saveSinglePlayerGameResults = async () => {
        console.log(turnCount.value)
        try {
            const gameData = {
                winner_user_id: authStore.userId,
                status: 'E', // Ended
                ended_at: new Date().toISOString().slice(0, 19).replace('T', ' '), total_time: Math.floor(elapsedTime.value / 1000),
                total_turns_winner: turnCount.value
            }

            const response = await axios.put(`games/${currentGameId.value}`, gameData)
            console.log('Game data updated:', response.data)
        } catch (error) {
            console.error('Error updating game data:', error)
        }
    }

    // Reset Game
    const resetGame = () => {
        initializeGame(mode.value)
    }


    return {
        cards,
        selectedCards,
        matchedCards,
        isGameWon,
        turnCount,
        mode,
        gridConfig,
        formattedTime,
        currentGameId,
        boardId,
        hasGameStarted,


        initializeGame,
        flipCard,
        resetGame,
        startTimer,
        resetTimer,
        stopTimer,
        revealHint
    }
})