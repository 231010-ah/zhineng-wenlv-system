<script setup>
import { ElMessageBox } from 'element-plus'
import { useBookingStore } from '../stores/booking'

const booking = useBookingStore()

const statusType = (status) => {
  if (status === 'cancelled') return 'info'
  if (status === 'verified') return 'warning'
  return 'success'
}

const cancel = async (record) => {
  await ElMessageBox.confirm(`确认取消 ${record.venueName} 的预约？`, '取消预约', { type: 'warning' })
  booking.cancelReservation(record.id)
}
</script>

<template>
  <main class="page-shell">
    <section class="page-title">
      <span class="eyebrow">预约记录</span>
      <h1>预约记录</h1>
      <p>查看北京文旅推荐方案、预约凭证状态和取消记录。</p>
    </section>

    <div class="glass-panel table-panel">
      <el-table :data="booking.records" empty-text="暂无预约记录" style="width: 100%">
        <el-table-column prop="id" label="票号" min-width="130" />
        <el-table-column prop="venueName" label="场馆" min-width="180" />
        <el-table-column prop="date" label="日期" min-width="120" />
        <el-table-column prop="slot" label="时段" min-width="140" />
        <el-table-column prop="visitor" label="参观人" min-width="100" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.status === 'booked'" link type="warning" @click="cancel(row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </main>
</template>

<style scoped>
.table-panel {
  border-radius: 28px;
  padding: 14px;
}

:deep(.el-table),
:deep(.el-table tr),
:deep(.el-table th.el-table__cell),
:deep(.el-table td.el-table__cell) {
  background: transparent;
  color: var(--text);
}

:deep(.el-table) {
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  --el-table-header-text-color: rgba(246, 242, 234, 0.64);
}
</style>
