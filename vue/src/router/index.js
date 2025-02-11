import HomeComponent from '@/components/HomeComponent.vue'
import Login from '@/components/auth/Login.vue'
import WebSocketTester from '@/components/WebSocketTester.vue'
import { createRouter, createWebHistory } from 'vue-router'
import GameBoard from '@/components/games/GameBoard.vue'
import Register from '@/components/auth/Register.vue'
import UserProfile from '@/components/users/UserProfile.vue'
import Games from '@/components/games/Games.vue'
import Users from '@/components/users/Users.vue'
import { useAuthStore } from '@/stores/auth'
import GlobalScores from '@/components/scoreboard/GlobalScores.vue'
import UsersScoreBoard from '@/components/scoreboard/UsersScoreBoard.vue'
import Statistics from '@/components/statistics/Statistics.vue'
import BrainCoinsPurchase from '@/components/transactions/BrainCoinsPurchase.vue'
import GameHistory from '@/components/history/GameHistory.vue'
import TransactionHistory from '@/components/history/TransactionHistory.vue'
import MultiplayerGames from '@/components/multiplayer/MultiplayerGames.vue'
import Shop from '@/components/shop/Shop.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeComponent
    },
    {
      path: '/shop',
      name: 'shop',
      component: Shop
    },
    {
      path: '/users',
      name: 'users',
      component: Users
    },
    {
      path: '/scoreboard',
      children: [
        {
          path: 'global',
          component: GlobalScores
        },
        {
          path: ':id',
          component: UsersScoreBoard
        }
      ]
    },
    {
      path: '/history',
      children: [
        {
          path: 'game',
          name: 'GameHistory',
          component: GameHistory,
        },
        {
          path: 'transaction',
          component: TransactionHistory
        }
      ]
    },
    {
      path: '/purchaseBrainCoins',
      name: 'BrainCoinsPurchase',
      component: BrainCoinsPurchase
    },
    {
      path: "/games",
      name: "games",
      component: Games
    },
    {
      path: '/profile/:id',
      name: 'UserProfile',
      component: UserProfile,
      props: true, // Pass route.params to props
    },
    {
      path: '/game/:mode',
      name: 'GameBoard',
      component: GameBoard,
      props: true
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/statistics',
      component: Statistics
    },
    {
      path: '/multiplayer',
      component: MultiplayerGames
    },
    {
      path: '/testers',
      children: [
        {
          path: 'websocket',
          component: WebSocketTester
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

   // Check for root route access
   if (to.name === 'home') {
    if (authStore.user && authStore.user.type === 'A') {
      next('/statistics') // Redirect non-admin users
      return
    }
  }

  // Existing users route protection
  // if (to.name === 'users') {
  //   if (!authStore.user || authStore.user.type !== 'A') {
  //     // next('/') // Redirect non-admin users
  //     return
  //   }
  // }

  next()
})

export default router
