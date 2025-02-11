<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-6">Statistics</h1>
    <div v-if="isAdmin" class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Admin Statistics</h2>
      <div class="bg-white p-4 rounded-lg shadow-md">
        <table class="min-w-full bg-white border border-gray-300 mb-4">
          <thead>
            <tr>
              <th class="py-2 border-b">Statistic</th>
              <th class="py-2 border-b">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-2 border-b">Total Purchases</td>
              <td class="py-2 border-b text-center">{{ adminStats.totalPurchases }}</td>
            </tr>
            <tr>
              <td class="py-2 border-b">Blocked Users</td>
              <td class="py-2 border-b text-center">{{ adminStats.blockedUsers }}</td>
            </tr>
            <tr>
              <td class="py-2 border-b">Last Month Revenue</td>
              <td class="py-2 border-b text-center">{{ adminStats.lastMonthRevenue }}</td>
            </tr>
          </tbody>
        </table>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-md mt-8">
        <h3 class="text-xl font-semibold mt-4 mb-2">Purchases by Player</h3>
        <StatisticsChart :chartData="adminChartData" />
      </div>
    </div>
    <div>
      <h2 class="text-2xl font-semibold mb-4">Generic Statistics</h2>
      <div class="bg-white p-4 rounded-lg shadow-md mb-8">
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th class="py-2 border-b">Statistic</th>
              <th class="py-2 border-b">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-2 border-b">Total Players</td>
              <td class="py-2 border-b text-center">{{ genericStats.totalPlayers }}</td>
            </tr>
            <tr>
              <td class="py-2 border-b">Total Games</td>
              <td class="py-2 border-b text-center">{{ genericStats.totalGames }}</td>
            </tr>
            <tr>
              <td class="py-2 border-b">Games Last Week</td>
              <td class="py-2 border-b text-center">{{ genericStats.gamesLastWeek }}</td>
            </tr>
            <tr>
              <td class="py-2 border-b">Games Last Month</td>
              <td class="py-2 border-b text-center">{{ genericStats.gamesLastMonth }}</td>
            </tr>
            <tr>
              <td class="py-2 border-b">Average Game Duration</td>
              <td class="py-2 border-b text-center">{{ genericStats.averageGameDuration }} seconds</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-4">Top Players by Wins</h3>
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th class="py-2 border-b">User Name</th>
              <th class="py-2 border-b">Wins</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in genericStats.topPlayersByWins" :key="player.name">
              <td class="py-2 border-b text-center">{{ player.name }}</td>
              <td class="py-2 border-b text-center">{{ player.wins }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import StatisticsChart from './StatisticsChart.vue';

export default {
  components: {
    StatisticsChart
  },
  setup() {
    const authStore = useAuthStore();
    const isAdmin = computed(() => authStore.user && authStore.userType === 'A');
    const genericStats = ref({});
    const adminStats = ref({});
    const errorMessage = ref('');

    const fetchGenericStats = async () => {
      try {
        const response = await axios.get('/stats/generic');
        genericStats.value = response.data;
      } catch (error) {
        errorMessage.value = 'Failed to fetch generic stats';
        console.error(error);
      }
    };

    const fetchAdminStats = async () => {
      try {
        const response = await axios.get('/stats/admin');
        adminStats.value = response.data;
      } catch (error) {
        errorMessage.value = 'Failed to fetch admin stats';
        console.error(error);
      }
    };

    const adminChartData = computed(() => {
      const purchasesByPlayer = adminStats.value.purchasesByPlayer || [];
      return {
        labels: purchasesByPlayer.map(player => player.user_id),
        datasets: [
          {
            label: 'Purchases by Player',
            backgroundColor: '#66BB6A',
            data: purchasesByPlayer.map(player => player.total)
          }
        ]
      };
    });

    onMounted(() => {
      fetchGenericStats();
      if (isAdmin.value) {
        fetchAdminStats();
      }
    });

    return {
      isAdmin,
      genericStats,
      adminStats,
      adminChartData,
      errorMessage
    };
  }
};
</script>