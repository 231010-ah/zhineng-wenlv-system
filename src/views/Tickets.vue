<script setup>
import { onUnmounted, ref } from 'vue'
import TicketQrCode from '../components/TicketQrCode.vue'
import { useBookingStore } from '../stores/booking'
import { createTicketQrPayload } from '../utils/qrCode'

const booking = useBookingStore()
const tearingTicketId = ref('')
let verifyTimer = null

const verifyTicket = (ticket) => {
  if (tearingTicketId.value) return

  tearingTicketId.value = ticket.id
  window.clearTimeout(verifyTimer)
  verifyTimer = window.setTimeout(() => {
    booking.verifyReservation(ticket.id)
    tearingTicketId.value = ''
  }, 980)
}

onUnmounted(() => {
  window.clearTimeout(verifyTimer)
})
</script>

<template>
  <main class="page-shell">
    <section class="page-title">
      <span class="eyebrow">预约凭证</span>
      <h1>北京文旅预约凭证</h1>
      <p>预约成功后可查看飞机票样式电子凭证，集中展示场馆、时间、出行人、预约编号和核销联信息。</p>
    </section>

    <el-empty v-if="!booking.tickets.length" description="暂无电子门票">
      <router-link class="liquid-button" to="/reservation">去预约</router-link>
    </el-empty>

    <section v-else class="ticket-grid">
      <div
        v-for="(ticket, index) in booking.tickets"
        :key="ticket.id"
        class="ticket-issue-stack"
        :style="{ '--issue-delay': `${120 + index * 950}ms` }"
      >
        <div class="ticket-printer" aria-hidden="true">
          <span></span>
        </div>

        <article class="boarding-pass" :class="{ 'is-tearing': tearingTicketId === ticket.id }">
          <div class="boarding-main">
            <div class="pass-header">
              <div>
                <span>BEIJING CULTURE AIR</span>
                <strong>BOARDING PASS</strong>
              </div>
              <em>{{ ticket.statusText }}</em>
            </div>

            <div class="route-row">
              <div>
                <small>FROM</small>
                <strong>PEK</strong>
                <span>北京文旅</span>
              </div>
              <i class="fas fa-plane"></i>
              <div>
                <small>TO</small>
                <strong>{{ ticket.venueName.slice(0, 2).toUpperCase() }}</strong>
                <span>{{ ticket.venueName }}</span>
              </div>
            </div>

            <div class="flight-grid">
              <div>
                <small>PASSENGER</small>
                <strong>{{ ticket.visitor }}</strong>
              </div>
              <div>
                <small>PHONE</small>
                <strong>{{ ticket.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}</strong>
              </div>
              <div>
                <small>DATE</small>
                <strong>{{ ticket.date }}</strong>
              </div>
              <div>
                <small>BOARDING</small>
                <strong>{{ ticket.slot }}</strong>
              </div>
              <div>
                <small>GATE</small>
                <strong>A{{ (ticket.id.length % 6) + 1 }}</strong>
              </div>
              <div>
                <small>SEAT</small>
                <strong>{{ (ticket.id.length % 8) + 1 }}C</strong>
              </div>
            </div>

            <div class="barcode" aria-hidden="true">
              <i v-for="n in 38" :key="n" :style="{ height: `${18 + ((n + ticket.id.length) % 5) * 8}px` }"></i>
            </div>

            <div class="pass-footer">
              <span>{{ ticket.id }}</span>
              <span>{{ ticket.venueType || '文化场馆' }}</span>
            </div>
          </div>

          <aside class="verify-stub" aria-label="核销联">
            <div class="stub-label">
              <span>CHECK-IN</span>
              <strong>核销联</strong>
            </div>
            <TicketQrCode
              class="qr-box"
              :payload="createTicketQrPayload(ticket)"
              dark-color="#07111f"
              accent-color="#1f5d9d"
            />
            <div class="stub-code">
              <small>VERIFY ID</small>
              <strong>{{ ticket.id }}</strong>
            </div>
            <div class="stub-meta">
              <span>{{ ticket.date }}</span>
              <span>{{ ticket.slot }}</span>
            </div>
            <button
              class="verify-button"
              type="button"
              :disabled="Boolean(tearingTicketId)"
              @click="verifyTicket(ticket)"
            >
              <i class="fas fa-scissors" aria-hidden="true"></i>
              <span>{{ tearingTicketId === ticket.id ? '核销中' : '核销凭证' }}</span>
            </button>
          </aside>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.ticket-grid {
  position: relative;
  display: grid;
  gap: 34px;
  padding-top: 22px;
}

.ticket-issue-stack {
  display: grid;
  perspective: 1400px;
}

.ticket-printer {
  justify-self: center;
  position: relative;
  z-index: 2;
  width: min(420px, 72vw);
  height: 22px;
  margin-bottom: -8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.04)),
    linear-gradient(90deg, rgba(7, 17, 31, 0.9), rgba(31, 93, 157, 0.72), rgba(7, 17, 31, 0.9));
  box-shadow:
    0 18px 38px rgba(0, 0, 0, 0.34),
    inset 0 -8px 14px rgba(0, 0, 0, 0.28);
}

.ticket-printer span {
  position: absolute;
  inset: 8px 34px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.66);
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.22);
}

.ticket-printer::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -32%;
  width: 28%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.46), transparent);
  opacity: 0;
  transform: skewX(-20deg);
}

.ticket-printer::after {
  animation: printerPulse 2s ease-out both;
  animation-delay: var(--issue-delay);
}

.boarding-pass {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 238px;
  min-height: 342px;
  overflow: hidden;
  border-radius: 30px;
  color: #07111f;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(226, 238, 249, 0.94)),
    radial-gradient(circle at 10% 0%, rgba(78, 133, 191, 0.18), transparent 18rem);
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform-origin: top center;
  will-change: clip-path, filter, opacity, transform;
}

.boarding-pass {
  animation: ticketIssueIn 2.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--issue-delay) + 180ms);
}

.boarding-pass .pass-header em {
  animation: statusStamp 0.64s cubic-bezier(0.17, 0.84, 0.44, 1) both;
  animation-delay: calc(var(--issue-delay) + 1.72s);
}

.barcode i {
  animation: barcodeRise 0.72s ease-out both;
  animation-delay: calc(var(--issue-delay) + 1.32s);
}

.boarding-pass::before,
.boarding-pass::after {
  content: "";
  position: absolute;
  right: 221px;
  z-index: 4;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #07111f;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.boarding-pass::before {
  top: -17px;
}

.boarding-pass::after {
  bottom: -17px;
}

.boarding-main,
.verify-stub {
  position: relative;
  padding: 28px;
}

.boarding-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.boarding-main::before {
  content: "";
  position: absolute;
  top: -20%;
  right: -12%;
  bottom: -20%;
  left: -12%;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(105deg, transparent 36%, rgba(31, 93, 157, 0.16) 48%, rgba(255, 255, 255, 0.72) 50%, rgba(31, 93, 157, 0.14) 52%, transparent 64%);
  opacity: 0;
  transform: translateX(-70%);
}

.boarding-main::before {
  animation: ticketScan 1.72s ease-out both;
  animation-delay: calc(var(--issue-delay) + 0.58s);
}

.boarding-main::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.08;
  pointer-events: none;
  background:
    linear-gradient(115deg, transparent 0 44%, #07111f 45% 45.5%, transparent 46%),
    repeating-linear-gradient(90deg, transparent 0 18px, rgba(7, 17, 31, 0.5) 18px 19px);
}

.pass-header,
.pass-footer,
.route-row,
.stub-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pass-header span,
.pass-header em,
.flight-grid small,
.route-row small,
.stub-code small,
.stub-label span {
  display: block;
  color: rgba(7, 17, 31, 0.52);
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.pass-header strong,
.stub-label strong {
  display: block;
  margin-top: 5px;
  font-size: 18px;
  letter-spacing: 0.08em;
}

.pass-header em {
  padding: 8px 12px;
  border: 1px solid rgba(7, 17, 31, 0.12);
  border-radius: 999px;
  color: #1f5d9d;
}

.route-row {
  justify-content: center;
  gap: clamp(24px, 7vw, 92px);
  text-align: center;
}

.route-row strong {
  display: block;
  font-size: clamp(54px, 9vw, 108px);
  line-height: 0.9;
  letter-spacing: 0;
}

.route-row span {
  display: block;
  width: min(220px, 26vw);
  overflow: hidden;
  color: rgba(7, 17, 31, 0.64);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-row i {
  color: #1f5d9d;
  font-size: 28px;
  transform: rotate(45deg);
}

.flight-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
  padding-top: 6px;
  border-top: 1px solid rgba(7, 17, 31, 0.12);
}

.flight-grid strong {
  display: block;
  margin-top: 6px;
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.barcode {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 54px;
  margin-top: auto;
}

.barcode i {
  width: 3px;
  background: #07111f;
}

.pass-footer {
  color: rgba(7, 17, 31, 0.54);
  font-size: 11px;
  letter-spacing: 0.12em;
}

.verify-stub {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-left: 1px dashed rgba(7, 17, 31, 0.28);
  background:
    linear-gradient(180deg, rgba(7, 17, 31, 0.045), rgba(7, 17, 31, 0.02)),
    repeating-linear-gradient(0deg, transparent 0 18px, rgba(7, 17, 31, 0.035) 18px 19px);
}

.verify-stub::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 18px;
  bottom: 18px;
  width: 16px;
  background: radial-gradient(circle, #07111f 0 6px, transparent 7px) 0 0 / 16px 28px repeat-y;
}

.verify-stub::after {
  content: "";
  position: absolute;
  inset: 12px;
  pointer-events: none;
  border: 1px solid rgba(7, 17, 31, 0.12);
  border-radius: 22px;
}

.stub-label,
.stub-code,
.stub-meta {
  position: relative;
  z-index: 1;
  text-align: center;
}

.stub-code strong {
  display: block;
  width: 180px;
  margin-top: 6px;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stub-meta {
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  color: rgba(7, 17, 31, 0.62);
  font-size: 12px;
}

.qr-box {
  z-index: 1;
  width: 132px;
  height: 132px;
}

.verify-button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: min(160px, 100%);
  height: 38px;
  border: 1px solid rgba(31, 93, 157, 0.24);
  border-radius: 999px;
  background: rgba(31, 93, 157, 0.09);
  color: #1f5d9d;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.verify-button:hover:not(:disabled) {
  border-color: rgba(31, 93, 157, 0.42);
  background: rgba(31, 93, 157, 0.16);
  transform: translateY(-1px);
}

.verify-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.boarding-pass.is-tearing {
  pointer-events: none;
  animation: ticketTearShell 0.98s ease-in both;
}

.boarding-pass.is-tearing .boarding-main,
.boarding-pass.is-tearing .verify-stub {
  will-change: clip-path, filter, opacity, transform;
}

.boarding-pass.is-tearing .boarding-main {
  clip-path: polygon(0 0, 96% 0, 91% 10%, 97% 20%, 92% 32%, 98% 44%, 91% 56%, 97% 68%, 92% 82%, 96% 100%, 0 100%);
  animation: tearMainAway 0.98s cubic-bezier(0.7, 0, 0.84, 0) both;
}

.boarding-pass.is-tearing .verify-stub {
  clip-path: polygon(8% 0, 100% 0, 100% 100%, 7% 100%, 12% 84%, 6% 70%, 13% 58%, 7% 45%, 12% 31%, 6% 19%);
  animation: tearStubAway 0.98s cubic-bezier(0.7, 0, 0.84, 0) both;
}

.boarding-pass.is-tearing .boarding-main::before {
  animation: tearFlash 0.58s ease-out both;
}

@keyframes printerPulse {
  0% {
    left: -32%;
    opacity: 0;
  }

  18%,
  72% {
    opacity: 1;
  }

  100% {
    left: 104%;
    opacity: 0;
  }
}

@keyframes ticketIssueIn {
  0% {
    clip-path: inset(0 0 92% 0 round 30px);
    filter: blur(8px) saturate(0.86);
    opacity: 0;
    transform: translateY(-86px) rotateX(-16deg) scaleY(0.14);
  }

  20% {
    opacity: 1;
  }

  72% {
    clip-path: inset(0 0 0 0 round 30px);
    filter: blur(0) saturate(1.03);
    transform: translateY(12px) rotateX(2deg) scaleY(1.02);
  }

  86% {
    transform: translateY(-3px) rotateX(0deg) scaleY(0.998);
  }

  100% {
    clip-path: inset(0 0 0 0 round 30px);
    filter: none;
    opacity: 1;
    transform: translateY(0) rotateX(0deg) scaleY(1);
  }
}

@keyframes ticketScan {
  0% {
    opacity: 0;
    transform: translateX(-70%);
  }

  20%,
  64% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateX(70%);
  }
}

@keyframes statusStamp {
  0% {
    opacity: 0;
    transform: scale(1.7) rotate(-8deg);
  }

  72% {
    opacity: 1;
    transform: scale(0.92) rotate(1deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes barcodeRise {
  0% {
    transform: scaleY(0.12);
    transform-origin: bottom;
  }

  100% {
    transform: scaleY(1);
    transform-origin: bottom;
  }
}

@keyframes ticketTearShell {
  0%,
  62% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
}

@keyframes tearMainAway {
  0% {
    filter: none;
    opacity: 1;
    transform: translateX(0) rotate(0deg);
  }

  28% {
    transform: translateX(-14px) rotate(-1.2deg);
  }

  100% {
    filter: blur(1px);
    opacity: 0;
    transform: translateX(-54vw) translateY(24px) rotate(-8deg);
  }
}

@keyframes tearStubAway {
  0% {
    filter: none;
    opacity: 1;
    transform: translateX(0) rotate(0deg);
  }

  28% {
    transform: translateX(12px) rotate(1.4deg);
  }

  100% {
    filter: blur(1px);
    opacity: 0;
    transform: translateX(38vw) translateY(18px) rotate(9deg);
  }
}

@keyframes tearFlash {
  0% {
    opacity: 0;
    transform: translateX(-40%);
  }

  42% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateX(42%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .boarding-pass,
  .boarding-main::before,
  .barcode i,
  .pass-header em,
  .ticket-printer::after,
  .boarding-pass.is-tearing,
  .boarding-pass.is-tearing .boarding-main,
  .boarding-pass.is-tearing .verify-stub {
    animation: none;
  }
}

@media (max-width: 760px) {
  .boarding-pass {
    grid-template-columns: 1fr;
  }

  .boarding-pass::before,
  .boarding-pass::after {
    display: none;
  }

  .verify-stub {
    border-top: 1px dashed rgba(7, 17, 31, 0.28);
    border-left: 0;
  }

  .verify-stub::before {
    inset: -8px 18px auto;
    width: auto;
    height: 16px;
    background: radial-gradient(circle, #07111f 0 6px, transparent 7px) 0 0 / 28px 16px repeat-x;
  }

  .flight-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .verify-button {
    width: min(220px, 100%);
  }

  .boarding-pass.is-tearing .boarding-main {
    clip-path: polygon(0 0, 100% 0, 100% 92%, 84% 97%, 70% 91%, 58% 98%, 45% 92%, 31% 97%, 19% 91%, 0 96%);
    animation-name: tearTopAway;
  }

  .boarding-pass.is-tearing .verify-stub {
    clip-path: polygon(0 8%, 18% 3%, 31% 9%, 45% 2%, 58% 8%, 72% 3%, 86% 9%, 100% 4%, 100% 100%, 0 100%);
    animation-name: tearBottomAway;
  }
}

@keyframes tearTopAway {
  0% {
    filter: none;
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }

  100% {
    filter: blur(1px);
    opacity: 0;
    transform: translateY(-42vh) rotate(-5deg);
  }
}

@keyframes tearBottomAway {
  0% {
    filter: none;
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }

  100% {
    filter: blur(1px);
    opacity: 0;
    transform: translateY(36vh) rotate(5deg);
  }
}
</style>
